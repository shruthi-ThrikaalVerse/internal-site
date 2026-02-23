
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppSection, User, AdminRequest } from '../types';
import { MOCK_EMPLOYEES, MOCK_ADMINS, MOCK_REQUESTS } from '../constants';

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
  admins: User[];
  requests: AdminRequest[];
  currentUser: User | null;
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

const LOGGED_IN_ADMIN: User = {
  id: 'sa-01',
  name: 'Sarah Connor',
  email: 'sarah.admin@company.com',
  role: 'SUPER_ADMIN',
  avatar: 'https://picsum.photos/seed/admin/200',
  status: 'active'
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Dashboard);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState<User[]>(MOCK_EMPLOYEES);
  const [admins, setAdmins] = useState<User[]>(MOCK_ADMINS);
  const [requests, setRequests] = useState<AdminRequest[]>(MOCK_REQUESTS);
  const [currentUser] = useState<User | null>(LOGGED_IN_ADMIN);

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

  return (
    <AppContext.Provider value={{
      isAuthenticated, setIsAuthenticated,
      activeSection, setActiveSection,
      globalSearch, setGlobalSearch,
      sidebarOpen, setSidebarOpen,
      mobileSidebarOpen, setMobileSidebarOpen,
      employees,
      admins,
      requests,
      currentUser,
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
