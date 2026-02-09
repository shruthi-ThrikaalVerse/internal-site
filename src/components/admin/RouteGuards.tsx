import React from 'react';
import { Navigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <LucideIcons.Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifying Identity...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  // Redirect non-admins to dashboard
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
