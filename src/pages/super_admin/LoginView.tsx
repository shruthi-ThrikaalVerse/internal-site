
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// switch to authentication context for real login
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';

export const LoginView = () => {
  const { login, logout } = useAuth();
  const { isAuthenticated, setIsAuthenticated } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear auth state when visiting this page
  useEffect(() => {
    // No need to clear localStorage, authentication uses HttpOnly cookies
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);

      // Validate that user has SUPER_ADMIN role
      if (user.role !== 'super_admin') {
        // Log out the user if they don't have the correct role
        try { await logout(); } catch { }
        setError('Invalid credentials. Only super administrators can access this portal.');
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      navigate('/super-admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
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
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <span className="text-white text-2xl font-bold">SA</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
            <p className="text-slate-500 mt-2 text-sm">Please enter your credentials to access the admin portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all sm:text-sm"
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
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-3 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Logging in with your authorized credentials to access the admin portal
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2024 Corporate HR Management System. v2.4.1
        </p>
      </div>
    </div>
  );
};
