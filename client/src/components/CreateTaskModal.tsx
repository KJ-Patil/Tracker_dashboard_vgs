import { useState, useEffect } from 'react';
import type { Project } from '../api/projects';
import type { UserSummary } from '../api/users';
import { getUsers } from '../api/users';
import { createTask } from '../api/tasks';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [developerId, setDeveloperId] = useState('');
  const [developers, setDevelopers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDevelopers();
      if (projects.length > 0 && !projectId) {
        setProjectId(projects[0].id);
      }
      const defaultDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDueDate(defaultDate);
    }
  }, [isOpen, projects]);

  const loadDevelopers = async () => {
    try {
      const devs = await getUsers('DEVELOPER');
      setDevelopers(devs);
      if (devs.length > 0 && !developerId) {
        setDeveloperId(devs[0].id);
      }
    } catch (err) {
      console.error('Failed to load developers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !dueDate || !projectId || !developerId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await createTask({
        title,
        description,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        projectId,
        developerId,
      });

      setTitle('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="clay-modal relative w-full max-w-lg p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)] dark:shadow-none">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="clay-btn-secondary p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="clay-input w-full px-3.5 py-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200"
            >
              {projects.length === 0 ? (
                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  No projects available
                </option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {p.name} ({p.client})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
              className="clay-input w-full px-3.5 py-2 text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specs and acceptance criteria..."
              className="clay-input w-full px-3.5 py-2 text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="clay-input w-full px-3 py-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Low</option>
                <option value="MEDIUM" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Medium</option>
                <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">High</option>
                <option value="CRITICAL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assign Developer</label>
              <select
                value={developerId}
                onChange={(e) => setDeveloperId(e.target.value)}
                required
                className="clay-input w-full px-3 py-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200"
              >
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {dev.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="clay-input w-full px-3 py-1.5 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="clay-btn-primary px-4.5 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
