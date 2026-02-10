import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const Login: React.FC = () => {
  const { login, user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mount, clear any existing token/user so arriving at login (e.g. via back) forces re-authentication
  useEffect(() => {
    try { localStorage.removeItem('authToken'); } catch { }
    try { localStorage.removeItem('user'); } catch { }
    if (logout) {
      logout().catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for authentication state changes and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'manager':
          navigate('/manager/dashboard');
          break;
        case 'auditor':
          navigate('/auditor/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Navigation will happen via useEffect when user state updates
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  // If already loading auth state, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/50 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl shadow-xl mb-8">H</div>
          <h1 className="text-5xl font-black text-white leading-tight">Empowering your <br /><span className="text-indigo-200">Workforce Dynamics.</span></h1>
          <p className="text-indigo-100 mt-6 text-lg max-w-md font-medium">The most comprehensive HRMS solution for modern enterprises. Streamline payroll, attendance, and performance in one secure portal.</p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 mb-8">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-white text-2xl font-black">500+</p>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Enterprises</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-white text-2xl font-black">1M+</p>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Active Users</p>
            </div>
          </div>
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">© 2024 AdminSync Infrastructure v2.1</p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => navigate('/login-selection')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to User Login
          </button>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 font-medium">Please enter your credentials to access the portal.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="admin@hrms.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-xs text-slate-500 font-medium cursor-pointer">Remember this device for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Authorize Access
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Clear token on mount when this login page is shown (ensures back-button clears session)
// Note: this is intentionally executed on mount to force re-authentication when hitting login via history.
/* eslint-disable react-hooks/rules-of-hooks */
// Place a small effect by exporting a helper that callers can optionally invoke; keep file-level effect simple.