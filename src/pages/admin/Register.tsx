import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager'>('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, role, password);
      // STRICT FLOW: Redirect to Login page after successful registration
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans">
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
          
          <div className="md:w-5/12 bg-[#c97a4c] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <Link to="/login" className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-12">
                <ArrowLeft size={14} /> Back to login
              </Link>
              <h2 className="text-3xl font-black leading-tight">Join the <br/>Admin Core.</h2>
              <p className="text-amber-100 mt-4 text-sm font-medium leading-relaxed opacity-80">Create your administrative identity to begin managing your organization's human capital.</p>
            </div>
            <div className="relative z-10 pt-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Shield size={20} className="text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">System Security Tier-1</p>
            </div>
          </div>

          <div className="md:w-7/12 p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Create Account</h3>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 mb-6 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#c97a4c] transition-colors" />
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#c97a4c] transition-colors" />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-100 focus:border-[#c97a4c] outline-none transition-all text-sm font-medium text-slate-700"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                <div className="flex gap-2">
                   <button 
                    type="button" 
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-[#c97a4c] border-[#c97a4c] text-white shadow-lg shadow-amber-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                   >
                     Admin
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setRole('manager')}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${role === 'manager' ? 'bg-[#c97a4c] border-[#c97a4c] text-white shadow-lg shadow-amber-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                   >
                     Manager
                   </button>
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#c97a4c] transition-colors" />
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-100 focus:border-[#c97a4c] outline-none transition-all text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-[#c97a4c] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-[#a56137] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Register Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
