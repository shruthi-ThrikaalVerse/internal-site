import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Wallet,
  CheckSquare,
  FileText,
  HelpCircle,
  Calendar,
  User,
  LogOut,
  X,
  Building2,
  Bell,
  TrendingUp,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onRouteChange?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  onLogout,
  isCollapsed = false,
  isMobile = false,
  onRouteChange = () => {}
}) => {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
    { name: 'Attendance', icon: Clock, path: '/employee/attendance' },
    { name: 'Calendar', icon: Calendar, path: '/employee/calendar' },
    { name: 'Leave', icon: CalendarDays, path: '/employee/leave' },
    { name: 'Payroll', icon: Wallet, path: '/employee/payroll' },
    { name: 'Tasks', icon: CheckSquare, path: '/employee/tasks' },
    { name: 'Performance', icon: TrendingUp, path: '/employee/performance' },
    { name: 'Documents', icon: FileText, path: '/employee/documents' },
    { name: 'Support', icon: HelpCircle, path: '/employee/requests' },
    { name: 'Events', icon: Calendar, path: '/employee/events' },
    { name: 'Notifications', icon: Bell, path: '/employee/notifications' },
    { name: 'Profile', icon: User, path: '/employee/profile' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLinkClick = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
    onRouteChange();
  };

  // Determine sidebar width based on state
  const sidebarWidth = isMobile ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Thin transparent scrollbar for those who want subtle scrolling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>

      {/* Logout Confirmation Modal - Centered on the page */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to logout from your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative 
          top-0 left-0 
          h-full 
          bg-slate-900 
          flex flex-col 
          z-40 
          transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${sidebarWidth}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white" />
            </div>
            {(isOpen || (!isMobile && !isCollapsed)) && (
              <span className="font-bold text-lg text-white tracking-tight truncate">
                Employee Portal
              </span>
            )}
          </div>
          {(isMobile && isOpen) && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              title="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Menu - Added scrollbar classes */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4 scrollbar-hide scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const shouldShowText = isOpen || (!isMobile && !isCollapsed);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={handleLinkClick}
              >
                <Icon size={18} className="flex-shrink-0" />
                {shouldShowText && (
                  <span className="ml-4 font-medium text-sm truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogoutClick}
            className={`flex items-center px-4 py-3 w-full rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors group`}
          >
            <LogOut size={18} />
            {(isOpen || (!isMobile && !isCollapsed)) && (
              <span className="ml-4 font-medium text-sm truncate">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;