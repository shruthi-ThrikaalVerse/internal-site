
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppSection, User, AdminRequest } from '../types.js';

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
  employees: User[];
  setEmployees: React.Dispatch<React.SetStateAction<User[]>>;
  admins: User[];
  requests: AdminRequest[];
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshCurrentUser: () => Promise<void>;
  addEmployee: (employee: User) => void;
  updateEmployee: (employee: User) => void;
  removeEmployee: (id: string) => void;
  terminateAdmin: (id: string) => void;
  requestEmployeeTermination: (employeeId: string, reason: string) => void;
  promoteToAdmin: (id: string) => void;
  demoteToEmployee: (id: string) => void;
  processRequest: (id: string, status: 'Approved' | 'Rejected') => void;
  setAdmins: React.Dispatch<React.SetStateAction<User[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to format base64 image data
const formatBase64Image = (imageData: string | null | undefined): string => {
  if (!imageData) return '';

  // If it's already a proper data URL, return as is
  if (imageData.startsWith('data:image')) {
    return imageData;
  }

  // If it's raw base64 without the prefix, add the JPEG prefix
  if (imageData.length > 0) {
    return `data:image/jpeg;base64,${imageData}`;
  }

  return '';
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user data exists in localStorage (set by AuthContext)
    return !!localStorage.getItem('user');
  });
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Dashboard);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Listen for changes to localStorage to update isAuthenticated
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('user'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch current user from API using HttpOnly cookie
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setCurrentUser(null);
          return;
        }

        const response = await fetch('http://localhost:8085/api/users/me', {
          method: 'GET',
          credentials: 'include', // Send HttpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser({
            id: data.employeeId || data.id,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            email: data.email,
            role: data.role || 'SUPER_ADMIN',
            avatar: formatBase64Image(data.profileImage) || '',
            status: 'active',
            department: data.department,
            designation: data.designation,
          } as User);
        } else if (response.status === 401 || response.status === 403) {
          // Token is invalid or expired
          setCurrentUser(null);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setCurrentUser(null);
      }
    };

    // Fetch when component mounts or when isAuthenticated changes
    if (isAuthenticated) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  // Fetch requests from API
  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/admin-hub/requests', {
          method: 'GET',
          credentials: 'include', // Send HttpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mappedRequests = Array.isArray(data) ? data : data.requests || [];
          setRequests(mappedRequests);
        } else if (response.status === 404) {
          // Endpoint doesn't exist, skip polling
          console.debug('Requests endpoint not available on backend');
        }
      } catch (err) {
        console.debug('Error fetching requests (endpoint may not be available):', err);
      }
    };

    fetchRequests();
    // Comment out polling as endpoint returns 404 - only fetch once
    // const interval = setInterval(fetchRequests, 30000); // Refresh every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  const addEmployee = (newEmployee: User) => {
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const updateEmployee = (updatedEmployee: User) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const terminateAdmin = (id: string) => {
    setAdmins(prev => prev.map(admin => admin.id === id ? { ...admin, status: 'inactive' } : admin));
  };

  const requestEmployeeTermination = (employeeId: string, reason: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const newRequest: AdminRequest = {
      id: `req-${Date.now()}`,
      type: 'Termination',
      requestedBy: currentUser?.name || 'System',
      requesterId: currentUser?.id || 'sys',
      targetId: employeeId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      details: reason
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const promoteToAdmin = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (employee) {
      const newAdmin: User = {
        ...employee,
        role: 'ADMIN',
        status: 'active'
      };
      setEmployees(prev => prev.filter(e => e.id !== id));
      setAdmins(prev => [newAdmin, ...prev]);
      setActiveSection(AppSection.AdminHub);
    }
  };

  const demoteToEmployee = (id: string) => {
    const admin = admins.find(a => a.id === id);
    if (admin) {
      const newEmployee: User = {
        ...admin,
        role: 'Employee',
        status: 'active',
        department: admin.department || 'Engineering'
      };
      setAdmins(prev => prev.filter(a => a.id !== id));
      setEmployees(prev => [newEmployee, ...prev]);
      setActiveSection(AppSection.EmployeeHub);
    }
  };

  const processRequest = (id: string, status: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (status === 'Approved') {
          if (req.type === 'Leave' && req.targetId && req.metadata?.days) {
            setEmployees(emps => emps.map(e => e.id === req.targetId ? { ...e, leaveBalance: Math.max(0, (e.leaveBalance || 0) - req.metadata.days) } : e));
          } else if (req.type === 'Termination' && req.targetId) {
            setEmployees(emps => emps.map(e => e.id === req.targetId ? { ...e, status: 'inactive' } : e));
          }
        }
        return { ...req, status };
      }
      return req;
    }));
  };

  const refreshCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          id: data.employeeId || data.id,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          role: data.role || 'SUPER_ADMIN',
          avatar: formatBase64Image(data.profileImage) || '',
          status: 'active',
          department: data.department,
          designation: data.designation,
        } as User);
      }
    } catch (err) {
      console.error('Error refreshing current user:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, setIsAuthenticated,
      activeSection, setActiveSection,
      globalSearch, setGlobalSearch,
      sidebarOpen, setSidebarOpen,
      mobileSidebarOpen, setMobileSidebarOpen,
      employees,
      setEmployees,
      admins,
      requests,
      currentUser,
      setCurrentUser,
      refreshCurrentUser,
      addEmployee,
      updateEmployee,
      removeEmployee,
      terminateAdmin,
      requestEmployeeTermination,
      promoteToAdmin,
      demoteToEmployee,
      processRequest,
      setAdmins
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
