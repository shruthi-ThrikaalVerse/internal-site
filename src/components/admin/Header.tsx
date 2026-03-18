import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User as UserIcon, ChevronDown, Check, Info, AlertTriangle, MessageSquare, Shield, Clock, X } from 'lucide-react';
import { getUserSpecificKey } from '../../utils/storage.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<any>(authUser || { name: 'Admin', role: 'Administrator' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  // Removed duplicate logout declaration
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();

    // Sync user from AuthContext
    setUser(authUser || { name: 'Admin', role: 'Administrator' });

    // Fetch profile image from API if not present
    const fetchProfileImage = async () => {
      if (!authUser || !authUser.email) return;
      try {
        const response = await fetch('http://localhost:8085/api/users/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          const userData = data.data || data;
          setUser(prev => ({ ...prev, ...userData }));
          if (userData.profileImage) setProfileImage(userData.profileImage);
          else if (userData.avatar) setProfileImage(userData.avatar);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchProfileImage();

    // Close notifications dropdown when a navigation originates elsewhere
    const handleCloseDropdown = () => setShowNotifications(false);
    window.addEventListener('closeNotificationsDropdown', handleCloseDropdown as EventListener);

    return () => {
      window.removeEventListener('closeNotificationsDropdown', handleCloseDropdown as EventListener);
    };
  }, [authUser]);

  const loadUserData = () => {
    // No longer needed, user comes from AuthContext and API
  };

  const loadNotifications = () => {
    const saved = JSON.parse(localStorage.getItem(getUserSpecificKey('admin_notifications_v1')) || '[]');
    setNotifications(saved);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(getUserSpecificKey('admin_notifications_v1'), JSON.stringify(updated));
    setNotifications(updated);
    // let other tabs/components know
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

  const mapTypeToPath = (type?: string, id?: string) => {
    if (!type) return undefined;
    switch (type) {
      case 'performance': return '/admin/performance';
      case 'attendance': return '/admin/attendance';
      case 'events': return '/admin/events';
      case 'login_activity': return '/admin/attendance';
      case 'system_updates': return `/admin/notifications/${id || ''}`;
      default: return undefined;
    }
  };

  const getDisplayInitial = () => {
    const firstName = user?.firstName || user?.fullName || '';
    const name = user?.name || '';
    if (firstName && typeof firstName === 'string' && firstName.length > 0) return firstName.charAt(0).toUpperCase();
    if (name && typeof name === 'string' && name.length > 0) return name.charAt(0).toUpperCase();
    return 'A';
  };

  const displayName = user?.firstName || user?.name || 'Admin';
  const displayRole = user?.role || user?.designation || 'Administrator';
  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper to format base64 image
  const formatBase64Image = (imageData: string | null | undefined): string => {
    if (!imageData) return '';
    if (imageData.startsWith('data:image')) return imageData;
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) return imageData;
    if (imageData.startsWith('/') && imageData.length < 100) return imageData;
    if (imageData.match(/^[A-Za-z0-9+/=]+$/) && imageData.length > 100) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    return '';
  };

  return (
    <header className="h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 z-50 sticky top-0" style={{ backgroundColor: '#2c3e50', borderBottom: '1px solid #1a252f' }}>
      {/* Left Section: Menu Toggle & Search */}
      <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 md:p-3 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-90 flex-shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} className="md:size-22 text-white" />
        </button>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 size-5" />
            <input
              type="text"
              placeholder="Search employees, modules, activity..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-0 rounded-[1.5rem] text-sm font-medium text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden p-2 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-90 flex-shrink-0"
          aria-label="Open Search"
        >
          <Search size={20} className="text-white" />
        </button>

        {/* Mobile Search Overlay */}
        {showMobileSearch && (
          <div className="fixed inset-0 bg-white z-[9998] md:hidden flex flex-col px-4 py-4">
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black size-5" />
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
            className={`relative p-2 md:p-3 rounded-2xl transition-all active:scale-90 ${showNotifications
              ? 'bg-orange-600 text-white shadow-xl'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            aria-label={unreadCount > 0 ? `Show ${unreadCount} unread notifications` : 'Show notifications'}
          >
            <Bell size={20} className="md:size-22" />
            {unreadCount > 0 && (
              <span className={`absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white text-[8px] md:text-[9px] font-black ${showNotifications
                ? 'bg-white text-orange-600'
                : 'bg-red-500 text-white animate-pulse'
                }`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 md:mt-4 w-screen max-w-xs md:w-96 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh]">
              <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-lg border border-blue-100">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      try {
                        setNotifications([]);
                        localStorage.removeItem(getUserSpecificKey('admin_notifications_v1'));
                      } catch (e) {
                        // ignore
                      }
                      // notify other tabs/components
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-md"
                    aria-label="Clear notifications"
                  >
                    Clear
                  </button>
                </div>
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
                          onClick={() => {
                            // mark read, close dropdown and navigate without full refresh
                            markAsRead(n.id);
                            setShowNotifications(false);

                            // Resolve redirect path: explicit `redirectPath` -> action.url -> type mapping -> fallback detail
                            const redirect = (n.redirectPath || n.redirect || (n.action && n.action.url) || mapTypeToPath(n.type, n.id));

                            if (redirect) {
                              if (/^https?:\/\//i.test(redirect)) {
                                window.open(redirect, '_blank');
                              } else {
                                navigate(redirect);
                              }
                            } else {
                              navigate(`/admin/notifications/${n.id}`);
                            }

                            // notify other components to close dropdowns
                            window.dispatchEvent(new Event('closeNotificationsDropdown'));
                          }}
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
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 px-2 md:px-4 py-1.5 hover:bg-slate-700 rounded-2xl transition-all active:scale-90"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-white leading-none">{displayName}</span>
              <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider mt-0.5">{displayRole}</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-2xl font-bold text-black flex-shrink-0" style={{ backgroundColor: '#ffffff' }}>
              {profileImage ? (
                <img
                  src={formatBase64Image(profileImage)}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                getDisplayInitial()
              )}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-xs font-black text-slate-900 truncate">{user?.email}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
              </div>
              <button
                onClick={() => {
                  navigate('/admin/profile');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <UserIcon size={16} /> View Profile
              </button>
              <div className="border-t border-slate-50 mt-2 pt-2">
                <button
                  onClick={() => {
                    logout();
                    navigate('/admin/login');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-bold"
                >
                  <X size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
