import type { DashboardStats, AdminStats, PMStats, DeveloperStats } from '../api/dashboard';
import type { User } from '../context/AuthContext';
import { 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  CalendarClock, 
  TrendingUp, 
  Layers, 
  Zap, 
  ShieldAlert,
  Sparkles,
  Plus
} from 'lucide-react';

interface MetricsHeaderProps {
  stats: DashboardStats | null;
  currentUser: User | null;
  onlineCount: number;
  onOpenCreateTask?: () => void;
  onOpenCreateProject?: () => void;
  onFilterStatus?: (status: string) => void;
  onFilterOverdue?: () => void;
}

export default function MetricsHeader({
  stats,
  currentUser,
  onlineCount,
  onOpenCreateTask,
  onOpenCreateProject,
  onFilterStatus,
  onFilterOverdue,
}: MetricsHeaderProps) {
  if (!stats || !currentUser) {
    return (
      <div className="grid grid-cols-12 gap-4.5 mb-6">
        <div className="col-span-12 lg:col-span-5 bento-card p-6 h-48 animate-pulse bg-white/60 dark:bg-slate-900/60" />
        <div className="col-span-12 sm:col-span-6 lg:col-span-2 bento-card p-6 h-48 animate-pulse bg-white/60 dark:bg-slate-900/60" />
        <div className="col-span-12 sm:col-span-6 lg:col-span-2 bento-card p-6 h-48 animate-pulse bg-white/60 dark:bg-slate-900/60" />
        <div className="col-span-12 lg:col-span-3 bento-card p-6 h-48 animate-pulse bg-white/60 dark:bg-slate-900/60" />
      </div>
    );
  }

  /* =========================================================================
     ADMIN BENTO METRICS
     ========================================================================= */
  if (currentUser.role === 'ADMIN' && stats.role === 'ADMIN') {
    const adminStats = stats as AdminStats;
    const totalTasks = adminStats.totalTasks;
    const doneCount = adminStats.tasksByStatus.DONE || 0;
    const inProgressCount = adminStats.tasksByStatus.IN_PROGRESS || 0;
    const inReviewCount = adminStats.tasksByStatus.IN_REVIEW || 0;
    const todoCount = adminStats.tasksByStatus.TODO || 0;
    const completionPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
    const overdueCount = adminStats.overdueCount || 0;

    return (
      <div className="grid grid-cols-12 gap-4.5 mb-6">
        {/* TILE 1: Sprint Velocity & Progress Hero */}
        <div className="col-span-12 lg:col-span-5 bento-card bento-card-hover p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/95 via-white/80 to-indigo-50/50 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/30">
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Agency Velocity
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Sprint Completion Rate
                  </span>
                </div>
              </div>

              <span className="bento-badge px-2.5 py-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                {completionPct}% Complete
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {doneCount}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                of {totalTasks} tasks resolved
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${totalTasks > 0 ? (doneCount / totalTasks) * 100 : 0}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Done: ${doneCount}`}
                />
                <div
                  style={{ width: `${totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`In Progress: ${inProgressCount}`}
                />
                <div
                  style={{ width: `${totalTasks > 0 ? (inReviewCount / totalTasks) * 100 : 0}%` }}
                  className="bg-purple-500 transition-all duration-500"
                  title={`In Review: ${inReviewCount}`}
                />
                <div
                  style={{ width: `${totalTasks > 0 ? (todoCount / totalTasks) * 100 : 0}%` }}
                  className="bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                  title={`To Do: ${todoCount}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => onFilterStatus?.('DONE')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Done</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{doneCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('IN_PROGRESS')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">In Prog</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{inProgressCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('IN_REVIEW')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase">Review</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{inReviewCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('TODO')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">To Do</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{todoCount}</span>
            </button>
          </div>
        </div>

        {/* TILE 2: Total Projects */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-2 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {adminStats.totalProjects}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              Agency portfolio
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{adminStats.totalUsers} registered team</span>
          </div>
        </div>

        {/* TILE 3: Overdue Risk Radar */}
        <div
          onClick={() => overdueCount > 0 && onFilterOverdue?.()}
          className={`col-span-12 sm:col-span-6 lg:col-span-2 bento-card bento-card-hover p-6 flex flex-col justify-between ${
            overdueCount > 0
              ? 'cursor-pointer border-rose-300/80 dark:border-rose-900/60 bg-gradient-to-br from-white/95 to-rose-50/40 dark:from-slate-900/90 dark:to-rose-950/20'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Overdue Risk
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              overdueCount > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              {overdueCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>

          <div className="my-2">
            <div className={`text-3xl font-black tracking-tight ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {overdueCount}
            </div>
            <span className={`text-xs font-semibold mt-1 block ${overdueCount > 0 ? 'text-rose-600/90 dark:text-rose-400/90' : 'text-slate-500 dark:text-slate-400'}`}>
              {overdueCount > 0 ? 'Cron flagged tasks' : '100% On schedule'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-medium">
            {overdueCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Filter overdue
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy cadence
              </span>
            )}
          </div>
        </div>

        {/* TILE 4: Live Team Pulse & WebSocket Presence */}
        <div className="col-span-12 lg:col-span-3 bento-card bento-card-hover p-6 flex flex-col justify-between bg-gradient-to-br from-white/95 to-slate-50/60 dark:from-slate-900/90 dark:to-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Live Team Pulse
              </span>
            </div>

            <span className="bento-badge px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
              WebSocket Sync
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {onlineCount}
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">active now</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                Real-time collaboration
              </span>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            {onOpenCreateProject && (
              <button
                type="button"
                onClick={onOpenCreateProject}
                className="flex-1 py-1 px-2 text-[11px] font-bold rounded-lg border border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3 text-indigo-500" /> Project
              </button>
            )}
            {onOpenCreateTask && (
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="flex-1 py-1 px-2 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" /> Task
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     PROJECT MANAGER BENTO METRICS
     ========================================================================= */
  if (currentUser.role === 'PROJECT_MANAGER' && stats.role === 'PROJECT_MANAGER') {
    const pmStats = stats as PMStats;
    const criticalCount = pmStats.tasksByPriority.CRITICAL || 0;
    const highCount = pmStats.tasksByPriority.HIGH || 0;
    const mediumCount = pmStats.tasksByPriority.MEDIUM || 0;
    const lowCount = pmStats.tasksByPriority.LOW || 0;
    const totalPriorityCount = criticalCount + highCount + mediumCount + lowCount || 1;
    const overdueCount = pmStats.overdueCount || 0;

    return (
      <div className="grid grid-cols-12 gap-4.5 mb-6">
        {/* TILE 1: PM Projects Portfolio (5 cols) */}
        <div className="col-span-12 lg:col-span-5 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Project Portfolio
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Managed Projects Overview
                </span>
              </div>
            </div>

            <span className="bento-badge px-2.5 py-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {pmStats.totalProjects} Active
            </span>
          </div>

          <div className="my-3 space-y-2 max-h-36 overflow-y-auto pr-1">
            {pmStats.projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No assigned projects yet</p>
            ) : (
              pmStats.projects.map((p) => (
                <div key={p.id} className="bento-subtile p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{p.client}</span>
                  </div>
                  <span className="bento-badge px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {p.taskCount} tasks
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Live delivery status</span>
            {onOpenCreateTask && (
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Quick Add Task
              </button>
            )}
          </div>
        </div>

        {/* TILE 2: Priority Spectrum (4 cols) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Priority Spectrum
              </span>
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {criticalCount} Critical
            </span>
          </div>

          <div className="my-3">
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(criticalCount / totalPriorityCount) * 100}%` }}
                className="bg-rose-500"
                title={`Critical: ${criticalCount}`}
              />
              <div
                style={{ width: `${(highCount / totalPriorityCount) * 100}%` }}
                className="bg-amber-500"
                title={`High: ${highCount}`}
              />
              <div
                style={{ width: `${(mediumCount / totalPriorityCount) * 100}%` }}
                className="bg-sky-500"
                title={`Medium: ${mediumCount}`}
              />
              <div
                style={{ width: `${(lowCount / totalPriorityCount) * 100}%` }}
                className="bg-slate-400 dark:bg-slate-600"
                title={`Low: ${lowCount}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-rose-600 dark:text-rose-400">● {criticalCount} Critical</span>
            <span className="text-amber-600 dark:text-amber-400">● {highCount} High</span>
            <span className="text-sky-600 dark:text-sky-400">● {mediumCount} Medium</span>
            <span className="text-slate-500 dark:text-slate-400">● {lowCount} Low</span>
          </div>
        </div>

        {/* TILE 3: Due This Week (3 cols) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {pmStats.upcomingThisWeekCount}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              Sprint milestones closing soon
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Overdue:</span>
            <span className={`font-bold ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {overdueCount} tasks
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     DEVELOPER BENTO METRICS
     ========================================================================= */
  if (currentUser.role === 'DEVELOPER' && stats.role === 'DEVELOPER') {
    const devStats = stats as DeveloperStats;
    const totalAssigned = devStats.totalAssigned;
    const doneCount = devStats.tasksByStatus.DONE || 0;
    const inProgressCount = devStats.tasksByStatus.IN_PROGRESS || 0;
    const inReviewCount = devStats.tasksByStatus.IN_REVIEW || 0;
    const todoCount = devStats.tasksByStatus.TODO || 0;
    const completionPct = totalAssigned > 0 ? Math.round((doneCount / totalAssigned) * 100) : 0;
    const overdueCount = devStats.overdueCount || 0;

    return (
      <div className="grid grid-cols-12 gap-4.5 mb-6">
        {/* TILE 1: My Task Velocity Hero (5 cols) */}
        <div className="col-span-12 lg:col-span-5 bento-card bento-card-hover p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/95 via-white/80 to-indigo-50/50 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/30">
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    My Workstream
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Assigned Task Velocity
                  </span>
                </div>
              </div>

              <span className="bento-badge px-2.5 py-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                {completionPct}% Complete
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {doneCount}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                of {totalAssigned} tasks resolved
              </span>
            </div>

            <div className="mt-4">
              <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${totalAssigned > 0 ? (doneCount / totalAssigned) * 100 : 0}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Done: ${doneCount}`}
                />
                <div
                  style={{ width: `${totalAssigned > 0 ? (inProgressCount / totalAssigned) * 100 : 0}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`In Progress: ${inProgressCount}`}
                />
                <div
                  style={{ width: `${totalAssigned > 0 ? (inReviewCount / totalAssigned) * 100 : 0}%` }}
                  className="bg-purple-500 transition-all duration-500"
                  title={`In Review: ${inReviewCount}`}
                />
                <div
                  style={{ width: `${totalAssigned > 0 ? (todoCount / totalAssigned) * 100 : 0}%` }}
                  className="bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                  title={`To Do: ${todoCount}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => onFilterStatus?.('DONE')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Done</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{doneCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('IN_PROGRESS')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">In Prog</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{inProgressCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('IN_REVIEW')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase">Review</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{inReviewCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus?.('TODO')}
              className="bento-subtile p-2 text-center hover:scale-[1.02] cursor-pointer transition-transform"
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">To Do</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{todoCount}</span>
            </button>
          </div>
        </div>

        {/* TILE 2: In Flight */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-2 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              In Flight
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {inProgressCount + inReviewCount}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              Active engineering focus
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{inReviewCount} under review</span>
          </div>
        </div>

        {/* TILE 3: Overdue Tasks */}
        <div
          onClick={() => overdueCount > 0 && onFilterOverdue?.()}
          className={`col-span-12 sm:col-span-6 lg:col-span-2 bento-card bento-card-hover p-6 flex flex-col justify-between ${
            overdueCount > 0
              ? 'cursor-pointer border-rose-300/80 dark:border-rose-900/60 bg-gradient-to-br from-white/95 to-rose-50/40 dark:from-slate-900/90 dark:to-rose-950/20'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Overdue
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              overdueCount > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              {overdueCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>

          <div className="my-2">
            <div className={`text-3xl font-black tracking-tight ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {overdueCount}
            </div>
            <span className={`text-xs font-semibold mt-1 block ${overdueCount > 0 ? 'text-rose-600/90 dark:text-rose-400/90' : 'text-slate-500 dark:text-slate-400'}`}>
              {overdueCount > 0 ? 'Requires attention' : 'All clear'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-medium">
            {overdueCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Filter overdue
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> On track
              </span>
            )}
          </div>
        </div>

        {/* TILE 4: Due This Week */}
        <div className="col-span-12 lg:col-span-3 bento-card bento-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {devStats.upcomingThisWeekCount}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              Upcoming sprint deliverables
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Online: {onlineCount} members</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Personal queue</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
