import type { ActivityItem } from '../api/activity';
import { Activity, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isConnected: boolean;
  userRole?: string;
}

export default function ActivityFeed({ activities, isConnected }: ActivityFeedProps) {
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Live Activity Feed
            </h3>
            <p className="text-[11px] text-slate-400">Activity History</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
            isConnected
              ? 'bg-slate-800 text-emerald-400 border-slate-700'
              : 'bg-slate-800 text-amber-400 border-slate-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span>{isConnected ? 'Connected' : 'Connecting'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 max-h-[560px]">
        {activities.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No activity recorded yet
          </div>
        ) : (
          activities.map((item, idx) => {
            return (
              <div
                key={item.id || `${item.action}-${idx}`}
                className="p-3 rounded border border-slate-800 bg-slate-950/60 text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <UserIcon className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-200">
                      {item.user?.name || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                        : 'now'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 pl-4 border-l border-slate-800 text-[11px] leading-relaxed">
                  {item.action}
                </p>

                {item.task?.project && (
                  <div className="mt-1.5 pl-4">
                    <span className="text-[10px] text-slate-400">
                      Project: {item.task.project.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        Restores last 20 events from database on reconnect
      </div>
    </div>
  );
}
