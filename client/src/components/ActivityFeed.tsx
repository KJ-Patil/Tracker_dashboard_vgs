import type { ActivityItem } from '../api/activity';
import { Activity, Clock, User as UserIcon, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isConnected: boolean;
  userRole?: string;
}

export default function ActivityFeed({ activities, isConnected }: ActivityFeedProps) {
  return (
    <div className="bento-card p-5 sm:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Live Activity Feed
            </h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Real-time team events</p>
          </div>
        </div>

        <div
          className={`bento-badge ${
            isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800'
          } px-2.5 py-1 text-[10px] font-bold`}
        >
          <span className={`h-2 w-2 rounded-full mr-1.5 ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span>{isConnected ? 'Connected' : 'Connecting'}</span>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5 max-h-[580px]">
        {activities.length === 0 ? (
          <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Radio className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No activity recorded yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Real-time updates will stream here</p>
          </div>
        ) : (
          activities.map((item, idx) => {
            return (
              <div
                key={item.id || `${item.action}-${idx}`}
                className="bento-subtile p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <UserIcon className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {item.user?.name || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                        : 'now'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-indigo-400 dark:border-indigo-500 text-xs leading-relaxed font-medium">
                  {item.action}
                </p>

                {item.task?.project && (
                  <div className="mt-2 pl-3">
                    <span className="bento-badge px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                      {item.task.project.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
        Restores last 20 events on reconnect
      </div>
    </div>
  );
}
