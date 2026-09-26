import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../api/projects';
import type { UserSummary } from '../api/users';
import { getUsers } from '../api/users';
import { X, FolderPlus, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [managerId, setManagerId] = useState('');
  const [pms, setPms] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.role === 'ADMIN') {
      loadPMs();
    }
  }, [isOpen, user]);

  const loadPMs = async () => {
    try {
      const pmUsers = await getUsers('PROJECT_MANAGER');
      setPms(pmUsers);
      if (pmUsers.length > 0 && !managerId) {
        setManagerId(pmUsers[0].id);
      }
    } catch (err) {
      console.error('Failed to load project managers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !client) {
      setError('Please provide both Project Name and Client Name.');
      return;
    }

    setLoading(true);
    try {
      await createProject({
        name,
        client,
        managerId: user?.role === 'ADMIN' && managerId ? managerId : undefined,
      });

      setName('');
      setClient('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="clay-modal relative w-full max-w-md p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)] dark:shadow-none">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create New Project</h3>
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Banking Revamp"
              className="clay-input w-full px-3.5 py-2 text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Client Organization</label>
            <input
              type="text"
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Apex Financial Corp"
              className="clay-input w-full px-3.5 py-2 text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assign Project Manager</label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="clay-input w-full px-3.5 py-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200"
              >
                {pms.map((pm) => (
                  <option key={pm.id} value={pm.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {pm.name} ({pm.email})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={loading}
              className="clay-btn-primary px-4.5 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
