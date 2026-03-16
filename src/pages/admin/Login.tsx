import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const Login: React.FC = () => {
  const { login, user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mount, clear any existing token/user so arriving at login (e.g. via back) forces re-authentication
  useEffect(() => {
    // Removed all localStorage usage, only HTTP-only cookies are used
    if (logout) {
      logout().catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for authentication state changes and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      // Validate that the user has the correct role for this login page
      // Accept both 'admin' and 'manager' roles (update if your actual role string is different)
      if (user.role !== 'admin' && user.role !== 'manager') {
        setError(`Invalid role for this login page. ${user.role === 'super_admin' ? 'Super Admins must use the Super Admin login.' : 'Please use the appropriate login portal for your role.'}`);
        logout().catch(() => { });
        return;
      }

      // Redirect based on role
      switch (user.role) {
        case 'admin':
        case 'manager':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, logout]);

  const validateEmail = (emailValue: string): string | null => {
    if (!emailValue.includes('@')) {
      return 'Email must contain @ symbol';
    }
    if (!emailValue.includes('.')) {
      return 'Email must contain a domain extension (e.g., .com)';
    }
    const afterAtSymbol = emailValue.split('@')[1];
    if (!afterAtSymbol || !afterAtSymbol.includes('.')) {
      return 'Email must contain a valid domain extension (e.g., .com)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        setIsSubmitting(false);
        return;
      }

      await login(email, password);
      // Navigation will happen via useEffect when user state updates
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If already loading auth state, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#c97a4c] animate-spin mx-auto mb-4" />
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
          <Loader2 className="w-12 h-12 text-[#c97a4c] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10">
          <button
            onClick={() => navigate('/login-selection')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#c97a4c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200">
              <span className="text-white text-2xl font-bold">HR</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
            <p className="text-slate-500 mt-2 text-sm">Please enter your credentials to access your portal</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300 mb-6">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#c97a4c] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-[#c97a4c] transition-all sm:text-sm"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-[#c97a4c] hover:text-[#a56137] hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#c97a4c] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-[#c97a4c] transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#c97a4c] focus:ring-[#c97a4c] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-[#c97a4c] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#a56137] focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || authLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSubmitting || authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2024 Corporate HR Management System. v2.4.1
        </p>
      </div>
    </div>
  );
};

export default Login;

// Clear token on mount when this login page is shown (ensures back-button clears session)
// Note: this is intentionally executed on mount to force re-authentication when hitting login via history.
/* eslint-disable react-hooks/rules-of-hooks */
// Place a small effect by exporting a helper that callers can optionally invoke; keep file-level effect simple.