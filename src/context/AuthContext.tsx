import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { clearUserData } from '../utils/storage.ts';

const API_BASE_URL = 'http://localhost:8085';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'auditor' | 'employee' | 'super_admin';
  avatar: string;
  performance?: {
    projectsCompleted: number;
    averageRating: number;
    attendance: string;
  };
}

// Normalize role strings coming from backend to our union type
const normalizeRole = (role: any): User['role'] => {
  const r = String(role || 'auditor').toLowerCase();
  // Check for super_admin before admin (since super_admin contains 'admin')
  if (r.includes('super') && r.includes('admin')) return 'super_admin';
  if (r.includes('admin')) return 'admin';
  if (r.includes('manager')) return 'manager';
  if (r.includes('employee')) return 'employee';
  if (r.includes('auditor')) return 'auditor';
  // fallback: treat unknown roles as 'auditor' to avoid granting admin/manager access
  return 'auditor';
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, role: 'admin' | 'manager' | 'auditor', password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifySession = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include', // Automatically sends HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json().catch(() => ({}));

        // Construct fullName from firstName/lastName if they're separate, otherwise use fullName or name
        let fullName = userData.fullName || userData.name || '';
        if (!fullName && (userData.firstName || userData.lastName)) {
          fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        }

        const user: User = {
          id: userData.id || userData._id || userData.employeeId || '',
          fullName: fullName,
          email: userData.email || '',
          role: normalizeRole(userData.role),
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        };
        setUser(user);
        try { localStorage.setItem('user', JSON.stringify(user)); } catch { }
        return user;
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired - clear session
        setUser(null);
        try { localStorage.removeItem('user'); } catch { }
        return null;
      } else {
        setUser(null);
        try { localStorage.removeItem('user'); } catch { }
        return null;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setUser(null);
      try { localStorage.removeItem('user'); } catch { }
      return null;
    }
  }, []);

  useEffect(() => {
    verifySession().finally(() => setIsLoading(false));
  }, [verifySession]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include', // Automatically sends and receives HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      // Backend will set HttpOnly cookie automatically
      // Verify session to get user data
      const verified = await verifySession();
      if (!verified) {
        throw new Error('Login succeeded but could not retrieve user information');
      }
      return verified;

    } catch (error: any) {
      throw error;
    }
  };

  const register = async (name: string, email: string, role: 'admin' | 'manager' | 'auditor', password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: name, email, role, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    // Get current user ID before clearing
    const currentUserId = user?.id;

    try {
      const resp = await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookie to backend for cleanup
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!resp.ok) {
        console.warn('Logout request returned non-OK status', resp.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all user-specific localStorage data
      if (user?.id) {
        clearUserData(user.id);
      }

      setUser(null);
      try { localStorage.removeItem('user'); } catch { }
      // Note: HttpOnly cookies are cleared by the backend on logout
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (response.ok) {
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Avatar update error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};