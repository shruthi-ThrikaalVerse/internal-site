import React, { useEffect, useRef, useState, useMemo } from 'react';
import GlobalSearch from './GlobalSearch';
import Icon from './Icon';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext';
import { useHRMS } from '../../context/HRMSContext.tsx';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC<{ setOpen: (val: boolean) => void }> = ({ setOpen }) => {
  const { user, logout } = useAuth();
  const { adminNotifications, markNotificationAsRead, employees, getProfilePhoto } = useHRMS();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'unread' | 'read'>('unread');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const relevantNotifications = useMemo(() => {
    if (!user) return [] as any[];
    const currentEmployee = employees.find(e => e.email === user.email);
    const employeeId = currentEmployee?.id;

    return adminNotifications.filter(n => {
      if (n.status === 'inactive') return false;
      if (n.type === 'global') return true;
      if (n.type === 'selected' && employeeId && n.targetEmployeeIds.includes(employeeId)) return true;
      return false;
    });
  }, [adminNotifications, user, employees]);

  const unreadNotifications = useMemo(() => {
    if (!user) return [] as any[];
    return relevantNotifications.filter(n => !n.readBy.includes(user.email));
  }, [relevantNotifications, user]);

  const readNotifications = useMemo(() => {
    if (!user) return [] as any[];
    return relevantNotifications.filter(n => n.readBy.includes(user.email));
  }, [relevantNotifications, user]);

  const unreadCount = unreadNotifications.length;

  const displayNotifs = notifTab === 'unread' ? unreadNotifications : readNotifications;

  return (
    <header className="sticky top-0 z-40 bg-white border-b h-16 flex items-center justify-between px-4 lg:px-8">
      <button aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        <Icon name="Menu" className="w-6 h-6" />
      </button>
      <GlobalSearch />
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-2xl transition-all border ${showNotifications ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
          >
            <LucideIcons.Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-100 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-4 border-b border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Alerts</h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} Unread</span>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button
                    onClick={() => setNotifTab('unread')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${notifTab === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >Unread</button>
                  <button
                    onClick={() => setNotifTab('read')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${notifTab === 'read' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >Read</button>
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {displayNotifs.length > 0 ? displayNotifs.map(n => {
                  const isRead = user ? n.readBy.includes(user.email) : false;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (user && !isRead) markNotificationAsRead(n.id, user.email);
                      }}
                      className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 relative group ${!isRead ? 'bg-indigo-50/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.priority === 'urgent' ? 'bg-rose-500' :
                          n.priority === 'high' ? 'bg-amber-500' :
                            'bg-indigo-500'
                          }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black text-slate-800 leading-tight ${!isRead ? '' : 'text-slate-500 line-through opacity-50'}`}>{n.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{n.dateTime}</p>
                        </div>
                        {!isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user) markNotificationAsRead(n.id, user.email);
                            }}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50"
                            title="Mark as read"
                          >
                            <LucideIcons.Check size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-12 text-center">
                    <LucideIcons.BellOff size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No notifications in this folder</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => { navigate('/notifications-admin'); setShowNotifications(false); }}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  System Log
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-1.5 shadow-sm hover:border-indigo-100 transition-all"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <p className="text-xs font-bold text-gray-900 leading-none">{user?.fullName || 'Super Admin'}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{user?.role || 'System'}</p>
              </div>
            </div>
            <img
              key={`profile-${user?.id}-${getProfilePhoto && user ? getProfilePhoto(user.id) : 'default'}`}
              src={getProfilePhoto && user ? (getProfilePhoto(user.id) || user.avatar) : (user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin")}
              className="w-8 h-8 rounded-full border-2 border-indigo-50 shadow-sm"
              alt="Admin"
            />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-xs font-black text-slate-900 truncate">{user?.email}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Cluster 01</p>
              </div>
              <button
                onClick={() => {
                  navigate('/admin/profile');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <Icon name="User" className="w-4 h-4" /> View Full Profile
              </button>
              <div className="border-t border-slate-50 mt-2 pt-2">
                <button
                  onClick={() => {
                    logout();
                    setIsAuthenticated(false);
                    navigate('/admin/login');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-bold"
                >
                  <Icon name="LogOut" className="w-4 h-4" /> End Session
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
