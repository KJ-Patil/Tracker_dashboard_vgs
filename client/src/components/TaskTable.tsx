import { useState } from 'react';
import type { Task } from '../api/tasks';
import type { User } from '../context/AuthContext';
import { AlertCircle, Clock, CheckCircle2, Lock, ListTodo, User as UserIcon } from 'lucide-react';
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
          <span className="bento-badge px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="bento-badge px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bento-badge px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5" />
            Medium
          </span>
        );
      default:
        return (
          <span className="bento-badge px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
            Low
          </span>
        );
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IN_REVIEW':
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="bento-card p-14 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Loading project tasks...</p>
      </div>
    );
  }

  return (
    <div className="bento-card overflow-hidden">
      {/* Table Card Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ListTodo className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            Task Command Center
            <span className="bento-badge px-2 py-0.5 text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {tasks.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-5">Task Details</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/30">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks found</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or search keywords</p>
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
                    className={`transition-colors ${
                      isOverdue
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/35'
                        : 'bg-white dark:bg-slate-900/30 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-5 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-start gap-2 leading-snug text-xs sm:text-[13px]">
                        {isOverdue && (
                          <span title="Overdue Task">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          </span>
                        )}
                        <span>{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {task.project?.name || 'Unassigned'}
                      </div>
                      {task.project?.client && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {task.project.client}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <UserIcon className="w-3 h-3" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {task.developer?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{priorityBadge(task.priority)}</td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                      {isOverdue ? (
                        <span className="inline-block mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                          Overdue ({formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                          {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {editable ? (
                        <div className="inline-flex items-center gap-1.5">
                          {isUpdating && (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          <select
                            value={task.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusSelect(task.id, e.target.value)}
                            aria-label={`Update status for ${task.title}`}
                            className={`bento-badge ${statusStyle(task.status)} border px-3 py-1 text-xs font-bold cursor-pointer focus:outline-none transition-all shadow-sm`}
                          >
                            <option value="TODO" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              TO DO
                            </option>
                            <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300">
                              IN PROGRESS
                            </option>
                            <option value="IN_REVIEW" className="bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300">
                              IN REVIEW
                            </option>
                            <option value="DONE" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">
                              DONE
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1.5 bento-badge ${statusStyle(task.status)} border px-3 py-1 text-[11px] font-bold`}
                        >
                          <Lock className="w-3 h-3 opacity-60" />
                          <span>{task.status}</span>
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
