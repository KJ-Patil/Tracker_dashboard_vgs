import { useEffect, useState, useCallback, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import type { Task } from '../api/tasks';
import { getTasks, updateTaskStatus } from '../api/tasks';
import type { Project } from '../api/projects';
import { getProjects } from '../api/projects';
import type { NotificationItem } from '../api/notifications';
import { getNotifications } from '../api/notifications';
import type { ActivityItem } from '../api/activity';
import { getActivityLogs } from '../api/activity';
import type { DashboardStats } from '../api/dashboard';
import { getDashboardStats } from '../api/dashboard';
import Navbar from '../components/Navbar';
import MetricsHeader from '../components/MetricsHeader';
import TaskFilterBar from '../components/TaskFilterBar';
import TaskTable from '../components/TaskTable';
import ActivityFeed from '../components/ActivityFeed';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const filterStatus = searchParams.get('status') || '';
  const filterPriority = searchParams.get('priority') || '';
  const filterProjectId = searchParams.get('projectId') || '';
  const filterIsOverdue = searchParams.get('isOverdue') === 'true';
  const filterSearch = searchParams.get('search') || '';
  const filterDueDateFrom = searchParams.get('dueDateFrom') || '';
  const filterDueDateTo = searchParams.get('dueDateTo') || '';

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        projectId: filterProjectId || undefined,
        isOverdue: filterIsOverdue ? 'true' : undefined,
        search: filterSearch || undefined,
        dueDateFrom: filterDueDateFrom || undefined,
        dueDateTo: filterDueDateTo || undefined,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setTasksLoading(false);
    }
  }, [
    filterStatus,
    filterPriority,
    filterProjectId,
    filterIsOverdue,
    filterSearch,
    filterDueDateFrom,
    filterDueDateTo,
  ]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadNotifCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  }, []);

  const loadInitialActivities = useCallback(async () => {
    try {
      const data = await getActivityLogs();
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch initial activities', err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadNotifications();
    loadStats();
    loadInitialActivities();
  }, [user?.id, loadTasks, loadProjects, loadNotifications, loadStats, loadInitialActivities]);

  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    const socket: Socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('catchup', (missedLogs: ActivityItem[]) => {
      if (Array.isArray(missedLogs)) {
        setActivities(missedLogs);
      }
    });

    socket.on('presence:count', (data: { onlineCount: number }) => {
      if (data && typeof data.onlineCount === 'number') {
        setOnlineCount(data.onlineCount);
      }
    });

    socket.on('activity:new', (newLog: ActivityItem) => {
      setActivities((prev) => [newLog, ...prev.slice(0, 29)]);
    });

    socket.on('task:updated', (payload: any) => {
      const updatedTask: Task = payload.task;
      if (!updatedTask) return;

      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );

      loadStats();
    });

    socket.on('task:created', (payload: any) => {
      const newTask: Task = payload.task;
      if (!newTask) return;

      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });

      loadStats();
    });

    socket.on('notification:new', (data: { notification: NotificationItem; unreadCount: number }) => {
      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadNotifCount(data.unreadCount);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, loadStats]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      loadStats();
      loadNotifications();
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadTasks();
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);
      if (typeof value === 'boolean') {
        if (value) {
          newParams.set(key, 'true');
        } else {
          newParams.delete(key);
        }
      } else if (value && value.trim() !== '') {
        newParams.set(key, value.trim());
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams);
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setSearchParams({});
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <Navbar
        notifications={notifications}
        unreadCount={unreadNotifCount}
        onlineCount={onlineCount}
        onRefreshNotifications={loadNotifications}
        onOpenCreateTask={() => setIsTaskModalOpen(true)}
        onOpenCreateProject={() => setIsProjectModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                Project Hub Dashboard
              </h1>
              <span className="bento-badge px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 transition-colors">
              Welcome back, <strong className="text-slate-900 dark:text-white font-extrabold">{user?.name}</strong>. Here is your team's live project velocity.
            </p>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="bento-btn-secondary px-3 py-1.5 text-xs font-semibold"
              >
                + Project
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bento-btn-primary px-3.5 py-1.5 text-xs font-bold"
              >
                + Task
              </button>
            </div>
          )}
        </div>

        <MetricsHeader
          stats={stats}
          currentUser={user}
          onlineCount={onlineCount}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
          onOpenCreateProject={() => setIsProjectModalOpen(true)}
          onFilterStatus={(status) => handleFilterChange('status', status)}
          onFilterOverdue={() => handleFilterChange('isOverdue', true)}
        />

        <TaskFilterBar
          status={filterStatus}
          priority={filterPriority}
          projectId={filterProjectId}
          isOverdue={filterIsOverdue}
          search={filterSearch}
          dueDateFrom={filterDueDateFrom}
          dueDateTo={filterDueDateTo}
          projects={projects}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2">
            <TaskTable
              tasks={tasks}
              currentUser={user}
              onStatusChange={handleStatusChange}
              loading={tasksLoading}
            />
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed
              activities={activities}
              isConnected={isSocketConnected}
              userRole={user?.role}
            />
          </div>
        </div>
      </main>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          loadTasks();
          loadStats();
        }}
        projects={projects}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => {
          loadProjects();
          loadStats();
        }}
      />
    </div>
  );
}

