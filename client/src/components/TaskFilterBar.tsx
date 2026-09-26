import { useState } from 'react';
import type { Project } from '../api/projects';
import { Search, X, Calendar, Share2, Check, AlertCircle } from 'lucide-react';

interface TaskFilterBarProps {
  status: string;
  priority: string;
  projectId: string;
  isOverdue: boolean;
  search: string;
  dueDateFrom: string;
  dueDateTo: string;
  projects: Project[];
  onFilterChange: (key: string, value: string | boolean) => void;
  onClearFilters: () => void;
}

export default function TaskFilterBar({
  status,
  priority,
  projectId,
  isOverdue,
  search,
  dueDateTo,
  projects,
  onFilterChange,
  onClearFilters,
}: TaskFilterBarProps) {
  const [copied, setCopied] = useState(false);

  const statuses = [
    { value: '', label: 'All Tasks' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DONE', label: 'Done' },
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const hasActiveFilters = Boolean(
    status || priority || projectId || isOverdue || search || dueDateTo
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bento-card p-5 mb-6">
      {/* Top Header Row with Status Segment Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto max-w-full">
          {statuses.map((s) => {
            const isActive = status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onFilterChange('status', s.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls (Share View & Reset) */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="bento-badge px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Active Filters
            </span>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="bento-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            title="Share filtered URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="bento-btn-secondary flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
            className="bento-input w-full pl-9.5 pr-3 py-2 text-xs font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Project Dropdown */}
        <div>
          <select
            value={projectId}
            onChange={(e) => onFilterChange('projectId', e.target.value)}
            aria-label="Filter by Project"
            className="bento-input w-full px-3 py-2 text-xs font-bold cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              All Projects ({projects.length})
            </option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <select
            value={priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            aria-label="Filter by Priority"
            className="bento-input w-full px-3 py-2 text-xs font-bold cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Overdue toggle */}
        <div>
          <button
            type="button"
            onClick={() => onFilterChange('isOverdue', !isOverdue)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isOverdue
                ? 'bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-sm'
                : 'bento-btn-secondary text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
            <span>Overdue Only</span>
          </button>
        </div>

        {/* Due on or before Date picker */}
        <div className="bento-input flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            value={dueDateTo}
            onChange={(e) => onFilterChange('dueDateTo', e.target.value)}
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none cursor-pointer"
            title="Due on or before date"
          />
        </div>
      </div>
    </div>
  );
}
