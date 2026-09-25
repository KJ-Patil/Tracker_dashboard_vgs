import type { DashboardStats } from '../api/dashboard';
import type { User } from '../context/AuthContext';
import { FolderGit2, CheckCircle2, Clock, AlertTriangle, Users, CalendarClock, Layers } from 'lucide-react';

interface MetricsHeaderProps {
  stats: DashboardStats | null;
  currentUser: User | null;
  onlineCount: number;
}

export default function MetricsHeader({ stats, currentUser, onlineCount }: MetricsHeaderProps) {
  if (!stats || !currentUser) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 animate-pulse h-20"></div>
        ))}
      </div>
    );
  }

  if (currentUser.role === 'ADMIN' && stats.role === 'ADMIN') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Projects</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalProjects}</div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Agency portfolio</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tasks Completed</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              {stats.tasksByStatus.DONE} <span className="text-xs font-normal text-slate-500">/ {stats.totalTasks}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.tasksByStatus.IN_PROGRESS} in prog · {stats.tasksByStatus.IN_REVIEW} review
            </div>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Overdue Tasks</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{stats.overdueCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5">Auto-flagged by cron</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Online Users</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              {onlineCount}
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">WebSocket presence</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'PROJECT_MANAGER' && stats.role === 'PROJECT_MANAGER') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">My Projects</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalProjects}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block truncate max-w-[160px]">
              {stats.projects.map((p) => p.name).join(', ') || 'No projects'}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Task Priorities</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-300">
              <span className="text-rose-400 font-semibold">{stats.tasksByPriority.CRITICAL} Crit</span>
              <span>·</span>
              <span className="text-amber-400">{stats.tasksByPriority.HIGH} High</span>
              <span>·</span>
              <span className="text-slate-400">{stats.tasksByPriority.MEDIUM + stats.tasksByPriority.LOW} Med/Low</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Active sprint load</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Due This Week</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.upcomingThisWeekCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Upcoming deadlines</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Overdue Tasks</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{stats.overdueCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Requires attention</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'DEVELOPER' && stats.role === 'DEVELOPER') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Assigned Tasks</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalAssigned}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Prioritized backlog</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">In Progress</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              {stats.tasksByStatus.IN_PROGRESS + stats.tasksByStatus.IN_REVIEW}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.tasksByStatus.IN_PROGRESS} active · {stats.tasksByStatus.IN_REVIEW} review
            </div>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Due This Week</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.upcomingThisWeekCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Upcoming milestones</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Overdue Tasks</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{stats.overdueCount}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Past due date</span>
          </div>
          <div className="p-2 rounded bg-slate-800 text-slate-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
