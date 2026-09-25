import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Briefcase, Code, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

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
      badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-800',
      icon: Shield,
    },
    {
      name: 'Alex Morgan',
      email: 'alex.pm@vgs.com',
      badge: 'PM',
      badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-800',
      icon: Briefcase,
    },
    {
      name: 'David Chen',
      email: 'david.pm@vgs.com',
      badge: 'PM',
      badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-800',
      icon: Briefcase,
    },
    {
      name: 'Ravi Patel',
      email: 'ravi.dev@vgs.com',
      badge: 'Dev',
      badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
      icon: Code,
    },
    {
      name: 'Elena Rostova',
      email: 'elena.dev@vgs.com',
      badge: 'Dev',
      badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
      icon: Code,
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus.dev@vgs.com',
      badge: 'Dev',
      badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
      icon: Code,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.dev@vgs.com',
      badge: 'Dev',
      badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800',
      icon: Code,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md my-6">
        <div className="text-center mb-6">
          <div className="inline-flex w-11 h-11 rounded-lg bg-indigo-600 items-center justify-center font-bold text-white text-base tracking-wider mb-2">
            VGS
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Client Project Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Velozity Global Solutions
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 sm:p-7 border border-slate-800 shadow-xl">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-200">Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your credentials to continue to the dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vgs.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2.5">
              Quick Switch (Select User Account)
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
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
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 text-left transition-all flex items-center justify-between text-xs cursor-pointer text-slate-300 hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.email}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3 font-mono">
              Password for all accounts: <code>password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
