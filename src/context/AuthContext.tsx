import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearUserData } from '../utils/storage.ts';

const API_BASE_URL = 'http://localhost:8085';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'auditor' | 'employee';
  avatar: string;
}

// Decode JWT token to extract payload
const decodeJWT = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
};

// Normalize role strings coming from backend to our union type
const normalizeRole = (role: any): User['role'] => {
  const r = String(role || 'auditor').toLowerCase();
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

  const verifySession = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token to Authorization header if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const userData = await response.json().catch(() => ({}));
        
        // Extract employeeId from JWT token
        let userId = userData.id || userData._id || userData.employeeId || '';
        if (!userId && token) {
          const decoded = decodeJWT(token);
          userId = decoded?.employeeId || decoded?.id || decoded?.sub || '';
        }
        
        const user: User = {
          id: userId,
          fullName: userData.fullName || userData.name || '',
          email: userData.email || '',
          role: normalizeRole(userData.role),
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        };
        setUser(user);
        try { localStorage.setItem('user', JSON.stringify(user)); } catch { }
        return user;
      } else {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setUser(null);
      localStorage.removeItem('authToken');
      return null;
    }
  };

  useEffect(() => {
    verifySession().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const responseData = await response.json().catch(() => ({}));

      // Extract token from response
      const token = responseData.token || responseData.accessToken || responseData.jwtToken || responseData.data?.token;

      // If a token is returned, persist it for API calls that use Authorization header
      if (token) {
        localStorage.setItem('authToken', token);
      }

      // If response includes user data, use it immediately
      const userData = responseData.data || responseData.user || responseData;
      if (userData && (userData.email || userData.id || userData._id || userData.employeeId)) {
        // Extract employeeId from JWT token if not in response
        let userId = userData.id || userData._id || userData.employeeId || '';
        if (!userId && token) {
          const decoded = decodeJWT(token);
          userId = decoded?.employeeId || decoded?.id || decoded?.sub || '';
        }
        
        const parsedUser: User = {
          id: userId,
          fullName: userData.fullName || userData.name || '',
          email: userData.email || '',
          role: normalizeRole(userData.role),
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        };
        setUser(parsedUser);
        try { localStorage.setItem('user', JSON.stringify(parsedUser)); } catch { }
        return parsedUser;
      }

      // If no user data in response, verify session
      const verified = await verifySession();
      if (!verified) {
        throw new Error('Login succeeded but no session information returned');
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
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all user-specific localStorage data with current user's ID
      if (user?.id) {
        clearUserData(user.id);
      }
      
      setUser(null);
      try { localStorage.removeItem('authToken'); } catch { }
      try { localStorage.removeItem('user'); } catch { }
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