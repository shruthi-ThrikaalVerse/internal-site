import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, User as UserIcon, ChevronDown, Check, Info, AlertTriangle, MessageSquare, Shield, Clock, X } from 'lucide-react';
import { getUserSpecificKey } from '../../utils/storage.ts';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [user, setUser] = useState<any>({ name: 'Employee', role: 'Staff' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
    loadNotifications();

    const handleStorage = () => {
      loadUserData();
      loadNotifications();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadUserData = () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  };

  const loadNotifications = () => {
    const saved = JSON.parse(localStorage.getItem(getUserSpecificKey('user_notifications_v1')) || '[]');
    setNotifications(saved);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(getUserSpecificKey('user_notifications_v1'), JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && showMobileSearch) {
        setShowMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSearch]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Check': return Check;
      case 'Shield': return Shield;
      case 'Clock': return Clock;
      case 'AlertCircle': return AlertTriangle;
      default: return Info;
    }
  };

  const getDisplayInitial = () => {
    const firstName = user?.firstName || '';
    const name = user?.name || '';
    if (firstName && typeof firstName === 'string' && firstName.length > 0) return firstName.charAt(0).toUpperCase();
    if (name && typeof name === 'string' && name.length > 0) return name.charAt(0).toUpperCase();
    return 'U';
  };

  const displayName = user?.firstName || user?.name || 'Employee';
  const displayRole = user?.role || user?.designation || 'Staff Member';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 md:h-20 bg-transparent border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 z-40 sticky top-0">
      {/* Left Section: Menu Toggle & Search */}
      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 md:p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-90 flex-shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} className="md:size-22" />
        </button>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 size-5" />
            <input
              type="text"
              placeholder="Search reports, employees, documents..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-[1.5rem] text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden p-2 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-90"
          aria-label="Open Search"
        >
          <Search size={20} />
        </button>

        {/* Mobile Search Overlay */}
        {showMobileSearch && (
          <div className="fixed inset-0 bg-white z-50 md:hidden flex items-center px-4">
            <div className="w-full" ref={searchRef}>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                  aria-label="Close Search"
                >
                  <X size={20} />
                </button>
                <h2 className="text-lg font-bold text-slate-800">Search</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="text"
                  placeholder="Search reports, employees, documents..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-[1.5rem] text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  autoFocus
                />
              </div>
              <div className="mt-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Links</p>
                <div className="space-y-2">
                  {['Dashboard', 'Reports', 'Employees', 'Documents'].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                      onClick={() => setShowMobileSearch(false)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={`relative p-2 md:p-3 rounded-2xl transition-all active:scale-90 ${showNotifications ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
            aria-label={unreadCount > 0 ? `Show ${unreadCount} unread notifications` : 'Show notifications'}
          >
            <Bell size={20} className="md:size-22" />
            {unreadCount > 0 && (
              <span className={`absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white text-[8px] md:text-[9px] font-black ${showNotifications ? 'bg-white text-blue-600' : 'bg-red-500 text-white animate-pulse'}`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 md:mt-4 w-screen max-w-xs md:w-96 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh]">
              <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-lg border border-blue-100">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-[300px] md:max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications
                    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                    .map(n => {
                      const IconComp = getIcon(n.icon);
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`w-full text-left px-4 md:px-8 py-4 md:py-5 hover:bg-slate-50 flex items-start gap-3 md:gap-4 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer ${!n.read ? 'bg-blue-50/10' : 'opacity-70'}`}
                        >
                          <div className={`mt-1 p-2 rounded-xl md:rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform ${n.color}`}>
                            <IconComp size={16} className="md:size-18" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-black text-slate-800 truncate">{n.title}</p>
                              {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1">{n.msg}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-16 md:py-20 text-center">
                    <Bell className="w-8 h-8 md:w-12 md:h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No active alerts</p>
                  </div>
                )}
              </div>
              <Link 
                to="/notifications" 
                onClick={() => setShowNotifications(false)} 
                className="block text-center py-3 md:py-4 bg-slate-50 border-t border-slate-100 text-[10px] font-black text-blue-600 uppercase tracking-wider hover:bg-blue-50 transition-colors"
              >
                Open Notifications Hub
              </Link>
            </div>
          )}
        </div>

        {/* Divider - Hidden on mobile */}
        <div className="w-px h-6 md:h-8 bg-slate-200 hidden sm:block mx-1"></div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className={`flex items-center gap-2 md:gap-3 pl-2 pr-3 md:pr-4 py-1.5 md:py-2 rounded-[1.5rem] transition-all border ${showProfileMenu ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-50' : 'hover:bg-slate-50 border-transparent hover:border-slate-200'}`}
            aria-label="Open profile menu"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getDisplayInitial()
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{displayName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-black mt-0.5">{displayRole}</p>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${showProfileMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 md:mt-4 w-60 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-50 mb-2 bg-slate-50/30">
                <p className="text-sm font-black text-slate-800 leading-tight truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'Employee'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'portal@company.com'}
                </p>
              </div>
              <div className="px-1 md:px-2 space-y-1">
                <Link 
                  to="/profile" 
                  onClick={() => setShowProfileMenu(false)} 
                  className="w-full text-left px-4 md:px-5 py-2.5 md:py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <UserIcon size={16} className="md:size-18" /> 
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/notifications" 
                  onClick={() => setShowProfileMenu(false)} 
                  className="w-full text-left px-4 md:px-5 py-2.5 md:py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <Bell size={16} className="md:size-18" /> 
                  <span>Activity Log</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;