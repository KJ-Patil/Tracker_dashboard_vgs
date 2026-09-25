import { useState } from 'react';
import type { Task } from '../api/tasks';
import type { User } from '../context/AuthContext';
import { AlertCircle, Clock, CheckCircle2, Lock } from 'lucide-react';
import { format, isPast, isToday, formatDistanceToNow } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  currentUser: User | null;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  loading?: boolean;
}

export default function TaskTable({
  tasks,
  currentUser,
  onStatusChange,
  loading,
}: TaskTableProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleStatusSelect = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await onStatusChange(taskId, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const canEditStatus = (task: Task) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'PROJECT_MANAGER' && task.project?.managerId === currentUser.id) return true;
    if (currentUser.role === 'DEVELOPER' && task.developerId === currentUser.id) return true;
    return false;
  };

  const priorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-rose-950/60 text-rose-300 border border-rose-800">
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-950/60 text-amber-300 border border-amber-800">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-sky-300 border border-slate-700">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
            Low
          </span>
        );
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-slate-800 text-emerald-300 border-slate-700';
      case 'IN_REVIEW':
        return 'bg-slate-800 text-purple-300 border-slate-700';
      case 'IN_PROGRESS':
        return 'bg-slate-800 text-sky-300 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-lg p-10 text-center text-slate-400 border border-slate-800 flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            Tasks
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[11px] font-mono">
              {tasks.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px]">
              <th className="py-2.5 px-3.5 font-medium">Task</th>
              <th className="py-2.5 px-3.5 font-medium">Project</th>
              <th className="py-2.5 px-3.5 font-medium">Assignee</th>
              <th className="py-2.5 px-3.5 font-medium">Priority</th>
              <th className="py-2.5 px-3.5 font-medium">Due Date</th>
              <th className="py-2.5 px-3.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-slate-600" />
                    <p className="text-xs text-slate-400">No tasks found</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isOverdue =
                  task.isOverdue ||
                  (task.status !== 'DONE' && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)));
                const editable = canEditStatus(task);
                const isUpdating = updatingTaskId === task.id;

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isOverdue ? 'bg-rose-950/15' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 max-w-sm">
                      <div className="font-medium text-slate-200 flex items-start gap-1.5 leading-snug">
                        {isOverdue && (
                          <span title="Overdue">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          </span>
                        )}
                        <span>{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="text-slate-300">
                        {task.project?.name || 'Unassigned'}
                      </div>
                      {task.project?.client && (
                        <span className="text-[10px] text-slate-400">
                          {task.project.client}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="text-slate-300">
                        {task.developer?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">{priorityBadge(task.priority)}</td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                      {isOverdue ? (
                        <span className="inline-block mt-0.5 text-[10px] text-rose-400 font-medium">
                          Overdue ({formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      {editable ? (
                        <div className="inline-flex items-center gap-1">
                          {isUpdating ? (
                            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : null}
                          <select
                            value={task.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusSelect(task.id, e.target.value)}
                            aria-label={`Update status for ${task.title}`}
                            className={`px-2 py-1 rounded text-xs border cursor-pointer focus:outline-none ${statusStyle(
                              task.status
                            )}`}
                          >
                            <option value="TODO" className="bg-slate-900 text-slate-200">
                              TO DO
                            </option>
                            <option value="IN_PROGRESS" className="bg-slate-900 text-slate-200">
                              IN PROGRESS
                            </option>
                            <option value="IN_REVIEW" className="bg-slate-900 text-slate-200">
                              IN REVIEW
                            </option>
                            <option value="DONE" className="bg-slate-900 text-slate-200">
                              DONE
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-1 rounded bg-slate-800 border border-slate-700"
                        >
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span className={statusStyle(task.status)}>
                            {task.status}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
