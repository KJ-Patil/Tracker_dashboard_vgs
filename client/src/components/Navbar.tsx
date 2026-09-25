import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { NotificationItem } from '../api/notifications';
import { markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Bell, CheckCheck, LogOut, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NavbarProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onlineCount: number;
  onRefreshNotifications: () => void;
  onOpenCreateTask?: () => void;
  onOpenCreateProject?: () => void;
}

export default function Navbar({
  notifications,
  unreadCount,
  onlineCount,
  onRefreshNotifications,
  onOpenCreateTask,
  onOpenCreateProject,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      onRefreshNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      onRefreshNotifications();
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-sm">
              VGS
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                Client Project Hub
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                Velozity Global Solutions
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="text-white">{onlineCount}</strong> {onlineCount === 1 ? 'online' : 'online'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <div className="hidden lg:flex items-center gap-1.5">
              {onOpenCreateProject && (
                <button
                  onClick={onOpenCreateProject}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  + Project
                </button>
              )}
              {onOpenCreateTask && (
                <button
                  onClick={onOpenCreateTask}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors cursor-pointer"
                >
                  + Task
                </button>
              )}
            </div>
          )}

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1 w-80 rounded-lg bg-slate-900 border border-slate-800 shadow-xl z-50 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-rose-900/40 text-rose-300 border border-rose-800">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs flex items-start justify-between gap-2.5 ${
                          n.isRead ? 'text-slate-400' : 'bg-slate-800/40 text-slate-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 cursor-pointer"
                          >
                            Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-left text-xs">
              <div className="font-medium text-slate-200 truncate max-w-[120px]">{user?.name}</div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
