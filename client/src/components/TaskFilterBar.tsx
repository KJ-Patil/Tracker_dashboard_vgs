import { useState } from 'react';
import type { Project } from '../api/projects';
import { Search, Filter, X, Calendar, Share2, Check, AlertCircle } from 'lucide-react';

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
    { value: '', label: 'All Statuses' },
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
    <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3 text-slate-400" />
                <span>Share URL</span>
              </>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            aria-label="Filter by Status"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            aria-label="Filter by Priority"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={projectId}
            onChange={(e) => onFilterChange('projectId', e.target.value)}
            aria-label="Filter by Project"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onFilterChange('isOverdue', !isOverdue)}
            className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
              isOverdue
                ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Overdue Only</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="date"
            value={dueDateTo}
            onChange={(e) => onFilterChange('dueDateTo', e.target.value)}
            className="w-full bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            title="Due on or before"
          />
        </div>
      </div>
    </div>
  );
}
