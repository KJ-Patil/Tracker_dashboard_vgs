import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { NotificationItem } from '../api/notifications';
import { markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Bell, CheckCheck, LogOut, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ThemeToggle from './ThemeToggle';

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
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.18)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-[4px_5px_12px_-1px_rgba(99,102,241,0.4),inset_1.5px_1.5px_2px_rgba(255,255,255,0.4),inset_-1.5px_-1.5px_3px_rgba(49,46,129,0.3)]">
              VGS
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5 transition-colors">
                Client Project Hub
                <span className="hidden sm:inline-flex clay-badge clay-badge-indigo text-[9px] px-2 py-0.2">
                  Live
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5">
                Velozity Global Solutions
              </p>
            </div>
          </div>
        </div>

        {/* Presence Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-[inset_1.5px_1.5px_3px_rgba(148,163,184,0.2),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.4),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.05)] text-xs text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">
            <strong className="text-slate-800 dark:text-white font-bold">{onlineCount}</strong> online
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <div className="hidden lg:flex items-center gap-2">
              {onOpenCreateProject && (
                <button
                  onClick={onOpenCreateProject}
                  className="clay-btn-secondary px-3 py-1.5 text-xs font-semibold"
                >
                  + Project
                </button>
              )}
              {onOpenCreateTask && (
                <button
                  onClick={onOpenCreateTask}
                  className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold"
                >
                  + Task
                </button>
              )}
            </div>
          )}

          {/* Theme Toggle (Light / Dark Mode) */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="clay-btn-secondary relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_2px_5px_rgba(244,63,94,0.5)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="clay-modal absolute right-0 mt-2 w-84 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[12px_18px_36px_-6px_rgba(148,163,184,0.4)] dark:shadow-[12px_18px_36px_-6px_rgba(0,0,0,0.7)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="clay-badge clay-badge-rose text-[10px] px-2 py-0.2">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs flex items-start justify-between gap-2.5 transition-colors ${
                          n.isRead
                            ? 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900'
                            : 'bg-indigo-50/40 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-200 font-medium'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="clay-btn-secondary text-[10px] px-2 py-1 rounded-lg shrink-0 font-semibold text-indigo-600 dark:text-indigo-400"
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

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden sm:block text-left text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">{user?.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</div>
            </div>
            <button
              onClick={() => logout()}
              className="clay-btn-secondary p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl"
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
