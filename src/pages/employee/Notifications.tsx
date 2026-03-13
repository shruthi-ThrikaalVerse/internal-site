import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markAllNotificationsRead, markNotificationAsRead } from '../../api/notifications.ts';
import {
  Bell, Check, Clock, User, Shield, Info, CheckCircle2, AlertCircle,
  Inbox, X, Search, Filter, Volume2, VolumeX,
  Star, Zap, ExternalLink, MoreVertical,
  BellOff, CheckCheck, Timer, Download, Upload,
  ChevronDown, ChevronUp, Trash2, Eye, EyeOff, Mail,
  Target, Calendar, LogIn, LogOut, TrendingUp,
  Award, Users, FileText, Briefcase, BarChart,
  Trophy, Coffee, Clock as ClockIcon, CalendarDays
} from 'lucide-react';

// ========== TYPES & INTERFACES ==========
interface Notification {
  id: string;
  title: string;
  msg: string;
  time: string;
  icon: string;
  color: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'attendance' | 'events' | 'login_activity' | 'system_updates';
  department?: string;
  employeeId?: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
    type: 'view' | 'download' | 'acknowledge';
  };
  snoozedUntil?: string;
  archived?: boolean;
  metadata?: {
    manager?: string;
    rating?: number;
    eventType?: string;
    location?: string;
    achievement?: string;
  };
}

type NotificationTab = 'all' | 'unread' | 'read';

// Static mock notifications removed — notifications should come from backend API only

// ========== CONSTANTS ==========
const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border border-blue-200',
  high: 'bg-amber-100 text-amber-700 border border-amber-200',
  critical: 'bg-rose-100 text-rose-700 border border-rose-200'
};

const priorityIcons = {
  low: Star,
  medium: Bell,
  high: AlertCircle,
  critical: Zap
};

const categoryColors = {
  performance: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  attendance: 'bg-blue-50 text-blue-700 border border-blue-200',
  events: 'bg-violet-50 text-violet-700 border border-violet-200',
  login_activity: 'bg-amber-50 text-amber-700 border border-amber-200',
  system_updates: 'bg-slate-50 text-slate-700 border border-slate-200'
};

const categoryIcons = {
  performance: Target,
  attendance: ClockIcon,
  events: Calendar,
  login_activity: LogIn,
  system_updates: Shield
};

const typeColors = {
  info: 'bg-blue-50 border border-blue-200',
  success: 'bg-emerald-50 border border-emerald-200',
  warning: 'bg-amber-50 border border-amber-200',
  system: 'bg-slate-50 border border-slate-200'
};

const iconMap: { [key: string]: React.FC<any> } = {
  Target, Calendar, LogIn, LogOut, TrendingUp, Award, Users,
  FileText, Briefcase, BarChart, Trophy, Coffee, ClockIcon,
  CalendarDays, Bell, Check, Shield, Info, AlertCircle, Star, Zap
};

// ========== CSS STYLES ==========
const styles = `
  .notification-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .notification-card {
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }

  .notification-card.unread {
    border-left: 4px solid rgba(59,130,246,0.95);
  }

  .notification-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }

  .unread-glow {
    position: relative;
  }

  .unread-glow::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  }

  .priority-badge {
    transition: all 0.2s ease;
  }

  .priority-badge:hover {
    transform: scale(1.05);
  }

  .animate-pulse-slow {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .notifications-list-container {
    max-height: 87vh;
    overflow: auto;
    padding-right: 6px;
  }

  /* Glass effect for modal */
  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

// ========== NOTIFICATION COMPONENT ==========
// Helper function to format time (shared)
const formatTime = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Convert html-containing notification.msg into readable plain text
const getFriendlyMessage = (msg: string) => {
  if (!msg) return '';
  const trimmed = msg.trim();

  // Try to parse HTML content
  try {
    // Check if it looks like HTML
    if (trimmed.startsWith('<') || trimmed.includes('</')) {
      const div = document.createElement('div');
      div.innerHTML = msg;

      // Get text content and clean it up
      let text = div.innerText || div.textContent || '';

      // Decode HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      text = textarea.value;

      // Clean up extra whitespace and line breaks
      text = text.replace(/\n\n+/g, '\n').trim();

      return text;
    }
  } catch (e) {
    // If parsing fails, continue with raw message
  }

  // Return as-is if not HTML or plain text already
  return trimmed;
};

const NotificationItem: React.FC<{
  notification: Notification;
  isSelected: boolean;
  isExpanded: boolean;
  highlight?: boolean;
  activeTab: NotificationTab;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onSnooze: (hours: number) => void;
}> = ({
  notification,
  isSelected,
  isExpanded,
  highlight = false,
  activeTab,
  onToggleSelect,
  onToggleExpand,
  onMarkAsRead,
  onDelete,
  onSnooze
}) => {
    const IconComp = iconMap[notification.icon] || Info;
    const PriorityIcon = priorityIcons[notification.priority] || Info;
    const CategoryIcon = categoryIcons[notification.category] || Info;

    const friendlyMsg = getFriendlyMessage(notification.msg);

    const getCategoryLabel = (category: string) => {
      const labels: { [key: string]: string } = {
        performance: 'Performance',
        attendance: 'Attendance',
        events: 'Events',
        login_activity: 'Login Activity',
        system_updates: 'System Updates'
      };
      return labels[category] || category;
    };

    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
      // mark as read in parent
      onMarkAsRead();
      // close any open header dropdowns
      window.dispatchEvent(new Event('closeNotificationsDropdown'));
      // navigate to notification detail
      if (notification.action && notification.action.url) {
        const url = notification.action.url;
        if (/^https?:\/\//i.test(url)) {
          window.open(url, '_blank');
        } else {
          navigate(url);
        }
      } else {
        navigate(`/employee/notifications/${notification.id}`);
      }
    };

    return (
      <div onClick={handleClick} className={`notification-card bg-white rounded-xl border ${!notification.read && activeTab === 'unread'
          ? 'border-blue-200 unread-glow'
          : notification.read
            ? 'border-slate-200'
            : 'border-slate-200'
        } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''} ${!notification.read && activeTab === 'unread' ? 'unread' : ''
        } ${highlight && !notification.read ? 'bg-yellow-50' : ''} hover:shadow-lg transition-all duration-200`}>
        <div className="p-4">
          <div className="flex gap-4">
            {/* Selection checkbox */}
            <div className="flex-shrink-0 pt-1">
              <input
                type="checkbox"
                aria-label={`Select notification: ${notification.title}`}
                checked={isSelected}
                onChange={onToggleSelect}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.read ? notification.color : `${notification.color} animate-pulse-slow`
              }`}>
              <IconComp className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900 font-bold'
                      }`}>
                      {notification.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`priority-badge px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${priorityColors[notification.priority]}`}>
                        <PriorityIcon className="w-3 h-3" />
                        {notification.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${categoryColors[notification.category]}`}>
                        <CategoryIcon className="w-3 h-3" />
                        {getCategoryLabel(notification.category)}
                      </span>
                      {notification.department && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {notification.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm ${notification.read ? 'text-slate-600' : 'text-slate-700'} ${isExpanded ? '' : 'line-clamp-2'
                    } leading-relaxed`}>
                    {friendlyMsg}
                  </p>

                  {/* Metadata display */}
                  {notification.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notification.metadata.rating && (
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                          Rating: {notification.metadata.rating}
                        </span>
                      )}
                      {notification.metadata.manager && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                          Manager: {notification.metadata.manager}
                        </span>
                      )}
                      {notification.metadata.location && (
                        <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-lg">
                          Location: {notification.metadata.location}
                        </span>
                      )}
                    </div>
                  )}

                  {friendlyMsg.length > 120 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Time and Actions */}
                <div className="flex flex-col items-start sm:items-end gap-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(notification.time)}
                  </span>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(
                              `http://localhost:8085/api/notifications/markRead/${notification.id}`,
                              {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                              }
                            );
                            if (response.ok) {
                              onMarkAsRead();
                            } else {
                              console.error('Failed to mark notification as read');
                            }
                          } catch (err) {
                            console.error('Failed to mark notification as read:', err);
                          }
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                      </button>
                    )}


                    <div className="relative">
                      <button aria-label="More options" aria-haspopup="true" className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                        <MoreVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-40 slide-in-right">
                        <div className="py-1">
                          <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                            Snooze for
                          </div>
                          {[1, 4, 8, 24].map((hours) => (
                            <button
                              key={hours}
                              onClick={() => onSnooze(hours)}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Timer className="w-4 h-4" />
                              {hours} hour{hours !== 1 ? 's' : ''}
                            </button>
                          ))}
                          <div className="border-t border-slate-100">
                            <button
                              onClick={onDelete}
                              className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button - View/Download/Acknowledge only */}
              {notification.action && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (notification.action?.url) window.open(notification.action.url, '_blank');
                      if (notification.action?.onClick) notification.action.onClick();
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow ${notification.action.type === 'acknowledge'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : notification.action.type === 'download'
                        ? 'bg-slate-600 hover:bg-slate-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {notification.action.type === 'download' && <Download className="w-4 h-4" />}
                    {notification.action.type === 'view' && <Eye className="w-4 h-4" />}
                    {notification.action.type === 'acknowledge' && <Check className="w-4 h-4" />}
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

// ========== MAIN COMPONENT ==========
const EmployeeNotifications: React.FC = () => {
  // State
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priorities: [] as string[],
    dateRange: 'all' as 'today' | 'week' | 'month' | 'all'
  });
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  // Fetch unread count
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyNotifications('UNREAD');
        if (Array.isArray(data)) {
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.warn('Failed to fetch unread count:', err);
      }
    })();
  }, []); // Run on mount



  // Filter notifications
  const getFilteredNotifications = useCallback(() => {
    let filtered = notifications.filter(notification => {
      if (activeTab === 'unread') return !notification.read;
      if (activeTab === 'read') return notification.read;
      return true; // 'all'
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        const msgText = getFriendlyMessage(n.msg).toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          msgText.includes(q) ||
          n.category.toLowerCase().includes(q)
        );
      });
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(n => filters.categories.includes(n.category));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(n => filters.priorities.includes(n.priority));
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(n => new Date(n.time) > cutoffDate);
    }

    return filtered.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [notifications, activeTab, searchQuery, filters]);

  // Notification actions
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Trigger refetch to keep data in sync with backend
    setRefetchTrigger(prev => prev + 1);
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      // Trigger refetch to keep data in sync with backend
      setRefetchTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Fallback to local update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      // Still trigger refetch on error to sync state
      setRefetchTrigger(prev => prev + 1);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Fetch notifications from API based on activeTab and refetchTrigger
  useEffect(() => {
    (async () => {
      try {
        let data: any[] = [];
        if (activeTab === 'all') {
          // show both read and unread
          const [readData, unreadData] = await Promise.all([
            getMyNotifications('READ'),
            getMyNotifications('UNREAD')
          ]);
          data = [...(Array.isArray(readData) ? readData : []), ...(Array.isArray(unreadData) ? unreadData : [])];
        } else if (activeTab === 'read') {
          data = await getMyNotifications('READ');
        } else if (activeTab === 'unread') {
          data = await getMyNotifications('UNREAD');
        } else {
          // no other tabs exist
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          // Map API response to Notification interface
          const mapped: Notification[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title || 'Notification',
            msg: item.message || '',
            time: item.createdAt || new Date().toISOString(),
            icon: 'Bell',
            color: 'text-blue-600 bg-blue-50',
            read: item.status === 'READ',
            type: item.priority === 'HIGH' ? 'warning' : 'info',
            priority: item.priority === 'HIGH' ? 'high' : 'medium',
            category: 'system_updates',
            department: undefined,
            employeeId: undefined,
            action: undefined,
            archived: false,
            metadata: undefined,
          }));

          setNotifications(mapped);
        } else {
          // No data, set empty
          setNotifications([]);
        }
      } catch (err: any) {
        console.warn(`getMyNotifications for ${activeTab} failed, keeping local notifications.`, err);
      }
    })();
  }, [activeTab, refetchTrigger]);

  const selectAllOnPage = () => {
    const pageIds = getFilteredNotifications().map(n => n.id);
    setSelectedIds(pageIds);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const bulkMarkAsRead = () => {
    setNotifications(prev => prev.map(n =>
      selectedIds.includes(n.id) ? { ...n, read: true } : n
    ));
    setSelectedIds([]);
    // Trigger refetch to keep data in sync with backend
    setRefetchTrigger(prev => prev + 1);
  };


  const toggleNotificationExpand = (id: string) => {
    setExpandedNotifications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const snoozeNotification = (id: string, hours: number) => {
    const snoozedUntil = new Date(Date.now() + hours * 3600000).toISOString();
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, snoozedUntil } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
    // No localStorage removal needed
  };


  const createPerformanceNotification = () => {
    const performancePhrases = [
      "Great work on completing the project ahead of schedule!",
      "Your code review feedback has been exceptionally helpful to the team.",
      "Customer satisfaction scores for your recent work are at 98%.",
      "You've successfully mentored 2 junior developers this month.",
      "Your documentation updates have improved team efficiency by 20%."
    ];

    const newNotification: Notification = {
      id: `perf_${Date.now()}`,
      title: 'Performance Recognition',
      msg: performancePhrases[Math.floor(Math.random() * performancePhrases.length)],
      time: new Date().toISOString(),
      icon: 'Award',
      color: 'text-emerald-600 bg-emerald-50',
      read: false,
      type: 'success',
      priority: 'high',
      category: 'performance',
      employeeId: 'EMP-2024-001',
      metadata: {
        rating: 4.8
      },
      action: {
        label: 'View Details',
        url: '/performance/details',
        type: 'view'
      }
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Removed localStorage persistence for notifications

  // Statistics
  // const archivedCount = notifications.filter(n => n.archived).length; // archive removed
  const performanceCount = notifications.filter(n => n.category === 'performance').length;
  const attendanceCount = notifications.filter(n => n.category === 'attendance').length;
  const eventsCount = notifications.filter(n => n.category === 'events').length;
  const loginActivityCount = notifications.filter(n => n.category === 'login_activity').length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <>
      <style>{styles}</style>
      <div className="notification-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br rounded-xl shadow-lg" style={{ backgroundColor: '#c97a4c' }}>
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Employee Notifications</h1>

                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span>Employee ID: EMP-2024-001</span>
                    <span className="text-slate-400">•</span>
                    <Briefcase className="w-4 h-4" />
                    <span>Engineering Department</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-6 items-center">
                <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Total</div>
                    <div className="text-2xl font-bold text-slate-900">{notifications.length}</div>
                  </div>
                  <div className="ml-2">
                    <div className="text-sm text-slate-500 font-medium">Unread</div>
                    <div className="text-xl font-semibold text-blue-600">{unreadCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Mobile Menu */}
            <div className="w-full lg:w-auto">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm"
              >
                <span>Menu & Filters</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employee notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-black"
                />
              </div>

              {/* Quick Actions */}
              <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2 items-center`}>
                <button
                  onClick={markAllRead}
                  className="flex-1 lg:flex-none px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCheck className="w-5 h-5" />
                  Mark All Read
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 lg:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>

              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tabs */}
              <div className="glass-effect rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="font-bold text-slate-900">Filter by Status</h3>
                </div>
                <div className="p-3">
                  {(['all', 'unread', 'read'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    const inactiveBg = '#f5e6da'; // light brown shade
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all ${isActive
                          ? 'text-white shadow-lg'
                          : 'text-slate-700 hover:shadow'
                          }`}
                        style={isActive ? { backgroundColor: '#c97a4c' } : { backgroundColor: inactiveBg }}
                      >
                        <span className="font-medium capitalize">{tab}</span>
                        {tab === 'unread' && unreadCount > 0 && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${isActive ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Summary */}
              <div className="glass-effect rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="font-bold text-slate-900">Categories</h3>
                </div>
                <div className="p-3 space-y-2">
                  {Object.entries(categoryIcons).map(([category, IconComp]) => (
                    <div key={category} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComp className="w-5 h-5 text-slate-500" />
                        <span className="text-sm text-slate-700 capitalize">
                          {category === 'login_activity' ? 'Login Activity' : category}
                        </span>
                      </div>
                      <span className="text-base font-semibold text-slate-900">
                        {notifications.filter(n => n.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="glass-effect rounded-2xl shadow-lg overflow-hidden slide-in-right">
                  <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Filters</h3>
                      <button
                        onClick={() => setFilters({ categories: [], priorities: [], dateRange: 'all' })}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Categories */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Categories</h4>
                      <div className="space-y-2">
                        {Object.entries(categoryColors).map(([category, className]) => (
                          <label key={category} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    categories: [...prev.categories, category]
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    categories: prev.categories.filter(c => c !== category)
                                  }));
                                }
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 capitalize">
                              {category === 'login_activity' ? 'Login Activity' : category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Priorities */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Priority Level</h4>
                      <div className="space-y-2">
                        {Object.entries(priorityColors).map(([priority]) => {
                          const PriorityIcon = priorityIcons[priority as keyof typeof priorityIcons];
                          return (
                            <label key={priority} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.priorities.includes(priority)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilters(prev => ({
                                      ...prev,
                                      priorities: [...prev.priorities, priority]
                                    }));
                                  } else {
                                    setFilters(prev => ({
                                      ...prev,
                                      priorities: prev.priorities.filter(p => p !== priority)
                                    }));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <PriorityIcon className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700 capitalize">{priority}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Time Period</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['today', 'week', 'month', 'all'].map((range) => (
                          <label key={range} className="relative">
                            <input
                              type="radio"
                              name="dateRange"
                              checked={filters.dateRange === range}
                              onChange={() => setFilters(prev => ({ ...prev, dateRange: range as any }))}
                              className="sr-only"
                            />
                            <div className={`p-3 text-center text-sm font-medium rounded-lg cursor-pointer transition-all ${filters.dateRange === range
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}>
                              {range.charAt(0).toUpperCase() + range.slice(1)}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content - Notifications */}
            <div className="lg:col-span-3">
              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-lg fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse-slow"></div>
                      <span className="font-bold text-blue-900">
                        {selectedIds.length} notification{selectedIds.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={bulkMarkAsRead}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                      >
                        Mark as read
                      </button>
                      <button
                        onClick={selectAllOnPage}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Select all
                      </button>
                      <button
                        onClick={deselectAll}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Deselect all
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="notifications-list-container custom-scrollbar space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      isSelected={selectedIds.includes(n.id)}
                      isExpanded={expandedNotifications.includes(n.id)}
                      highlight={activeTab === 'all' && !n.read}
                      activeTab={activeTab}
                      onToggleSelect={() => toggleSelect(n.id)}
                      onToggleExpand={() => toggleNotificationExpand(n.id)}
                      onMarkAsRead={() => markAsRead(n.id)}
                      onDelete={() => deleteNotification(n.id)}
                      onSnooze={(hours) => snoozeNotification(n.id, hours)}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                      <Inbox className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {searchQuery ? 'No results found' : 'All caught up!'}
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                      {searchQuery
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : 'You\'re up to date with all employee notifications.'
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </>
  );
};

export default EmployeeNotifications;