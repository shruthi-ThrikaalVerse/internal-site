
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.tsx';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 sm:p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#f37321] rounded-2xl shadow-xl shadow-[#f37321]/20 mb-4 text-white">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e6eef8] tracking-tight">SuperAdmin Pro</h1>
          <p className="text-[#9aa8bd] mt-2 text-sm sm:text-base">Enterprise Resource Management Portal</p>
        </div>

        <div className="bg-[#0b1220] p-6 sm:p-8 rounded-3xl shadow-2xl border border-[#1f2937]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#9aa8bd] mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] focus:ring-4 focus:ring-[#f37321]/10 focus:border-[#f37321] outline-none transition-all placeholder-[#9aa8bd]/20"
                placeholder="admin@pro.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-bold text-[#9aa8bd] uppercase tracking-wider">Password</label>
                <button type="button" className="text-[10px] sm:text-xs font-bold text-[#f37321] hover:text-[#e06410] transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] focus:ring-4 focus:ring-[#f37321]/10 focus:border-[#f37321] outline-none transition-all placeholder-[#9aa8bd]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa8bd] hover:text-[#e6eef8]"
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
              className={`w-full py-3.5 bg-[#f37321] text-white rounded-xl font-bold shadow-lg shadow-[#f37321]/30 hover:bg-[#e06410] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1f2937] text-center">
            <p className="text-[10px] text-[#9aa8bd] leading-relaxed">
              Security notice: Dummy credentials are <strong>admin@pro.com</strong> / <strong>password123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
