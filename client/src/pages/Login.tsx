import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Briefcase, Code, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPass,
      });
      login(response.data.user, response.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const quickLogins = [
    {
      name: 'Sarah Connor',
      email: 'admin@vgs.com',
      badge: 'Admin',
      badgeClass: 'clay-badge-rose',
      icon: Shield,
    },
    {
      name: 'Alex Morgan',
      email: 'alex.pm@vgs.com',
      badge: 'PM',
      badgeClass: 'clay-badge-purple',
      icon: Briefcase,
    },
    {
      name: 'David Chen',
      email: 'david.pm@vgs.com',
      badge: 'PM',
      badgeClass: 'clay-badge-purple',
      icon: Briefcase,
    },
    {
      name: 'Ravi Patel',
      email: 'ravi.dev@vgs.com',
      badge: 'Dev',
      badgeClass: 'clay-badge-indigo',
      icon: Code,
    },
    {
      name: 'Elena Rostova',
      email: 'elena.dev@vgs.com',
      badge: 'Dev',
      badgeClass: 'clay-badge-indigo',
      icon: Code,
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus.dev@vgs.com',
      badge: 'Dev',
      badgeClass: 'clay-badge-indigo',
      icon: Code,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.dev@vgs.com',
      badge: 'Dev',
      badgeClass: 'clay-badge-indigo',
      icon: Code,
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-200">
      {/* Floating Theme Switcher Button */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-10">
        <ThemeToggle showLabel className="px-3 py-2 shadow-sm" />
      </div>

      <div className="w-full max-w-md my-8">
        {/* Header Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 items-center justify-center font-extrabold text-white text-lg tracking-wider mb-3 shadow-[6px_8px_20px_-2px_rgba(99,102,241,0.4),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(49,46,129,0.3)]">
            VGS
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5 transition-colors">
            Client Project Hub
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Velozity Global Solutions
          </p>
        </div>

        {/* Claymorphic Main Card */}
        <div className="clay-card p-6 sm:p-8 rounded-3xl">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your credentials to access your live workspace
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vgs.com"
                  className="clay-input w-full pl-10 pr-3.5 py-2.5 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="clay-input w-full pl-10 pr-3.5 py-2.5 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick User Switcher */}
          <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Quick Demo Switcher</span>
              <span className="text-[10px] lowercase font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
                1-click login
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {quickLogins.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => {
                      setEmail(item.email);
                      setPassword('password123');
                      handleLogin(item.email, 'password123');
                    }}
                    className="clay-btn-secondary w-full p-2.5 text-left flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(199,210,254,0.4)] dark:shadow-none">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{item.email}</div>
                      </div>
                    </div>
                    <span className={`clay-badge ${item.badgeClass} text-[10px] px-2.5 py-0.5 font-bold`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-3.5 font-mono bg-slate-100/70 dark:bg-slate-800/60 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              Demo password for all: <code className="font-semibold text-indigo-600 dark:text-indigo-400">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
