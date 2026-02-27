
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const LoginView = () => {
  const { setIsAuthenticated, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/super-admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@pro.com' && password === 'password123') {
        setIsAuthenticated(true);
        navigate('/super-admin/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-4 text-left">
          <button
            type="button"
            onClick={() => navigate('/login-selection')}
            className="text-sm text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2"
          >
            ← Back
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4 text-white">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">SuperAdmin Pro</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Enterprise Resource Management Portal</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all placeholder-gray-400"
                placeholder="admin@pro.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <button type="button" className="text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold animate-in shake duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} focus:ring-4 focus:ring-blue-500/50`}
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Security notice: Dummy credentials are <strong>admin@pro.com</strong> / <strong>password123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
