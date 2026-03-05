import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext';
import Icon from './Icon';

const Sidebar: React.FC<{ isOpen: boolean; setOpen: (val: boolean) => void }> = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { setIsAuthenticated } = useApp();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  // Map NAV_ITEMS IDs to actual route paths
  const getRoutePath = (itemId: string) => {
    const pathMap: Record<string, string> = {
      'admin/dashboard': '/admin/dashboard',
      'admin/employees': '/admin/employee-hub',
      'admin/documents': '/admin/document-management',
      'admin/attendance': '/admin/attendance-monitor',
      'admin/leave': '/admin/leave-center',
      'admin/requests': '/admin/requests',
      'admin/tasks': '/admin/tasks',
      'admin/events': '/admin/events',
      'admin/notifications': '/admin/notifications',
      'admin/payroll': '/admin/payroll-processing',
      'admin/payslips': '/admin/payslips',
      'admin/performance': '/admin/performance-management',
      'admin/audit-logs': '/admin/audit-logs',
      'admin/profile': '/admin/profile',
    };
    return pathMap[itemId] || `/${itemId}`;
  };

  // Check if current path matches the item
  const isActive = (itemId: string) => {
    const routePath = getRoutePath(itemId);
    return location.pathname === routePath;
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">H</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Admin <span className="text-indigo-600">Sync</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto invisible-scrollbar">
          {(NAV_ITEMS || []).map((item) => (
            <Link
              key={item.id}
              to={getRoutePath(item.id)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${isActive(item.id)
                ? 'bg-indigo-600 text-white font-semibold shadow-xl shadow-indigo-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 font-bold text-sm hover:bg-rose-50 transition-all active:scale-95"
          >
            <Icon name="LogOut" className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
