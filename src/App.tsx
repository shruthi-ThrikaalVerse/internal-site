import React, { useMemo, useEffect, useState, useRef } from 'react';
import * as projectsApi from './api/projects.js';
import { Project } from './types.js';
import { useAuth } from './context/AuthContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, LogOut, Menu, X,
  Users, UserPlus, Zap, Settings, HelpCircle, Shield,
  LayoutDashboard, FileText, AlertCircle, DollarSign, GitBranch, BarChart3, Star, Calendar, TrendingUp, Wrench, User
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext.js';
import { AppSection } from './types.js';
import {
  NAVIGATION_ITEMS, MOCK_LOGS,
  MOCK_PERFORMANCE_METRICS
} from './constants.js';
import { StatCard, SectionHeader } from './pages/super_admin/UI.js';
import { DashboardView } from './pages/super_admin/DashboardView.js';
import { EmployeeHub } from './pages/super_admin/EmployeeHub.js';
import { AdminHub } from './pages/super_admin/AdminHub.js';
import { AdminRequests } from './pages/super_admin/AdminRequests.js';
import { AuditLogsView } from './pages/super_admin/AuditLogsView.js';
import { PayrollView } from './pages/super_admin/PayrollView.js';
import { ProjectsView } from './pages/super_admin/ProjectsView.js';
import { SystemMaintenance } from './pages/super_admin/SystemMaintenance.js';
import { ReviewsView } from './pages/super_admin/ReviewsView.js';
import { EventsView } from './pages/super_admin/EventsView.js';
import { PaymentUpdatesView } from './pages/super_admin/PaymentUpdatesView.js';
import { NotificationsView } from './pages/super_admin/NotificationsView.js';
import { ProfileView } from './pages/super_admin/ProfileView.js';
import DocumentsView from './pages/super_admin/DocumentsView.js';
import AdminDetails from './pages/super_admin/AdminDetails.js';

// Icon name to component mapper
const iconMap: Record<string, React.ReactNode> = {
  'LayoutDashboard': <LayoutDashboard size={20} />,
  'Users': <Users size={20} />,
  'Settings': <Settings size={20} />,
  'FileText': <FileText size={20} />,
  'AlertCircle': <AlertCircle size={20} />,
  'DollarSign': <DollarSign size={20} />,
  'GitBranch': <GitBranch size={20} />,
  'BarChart3': <BarChart3 size={20} />,
  'Star': <Star size={20} />,
  'Calendar': <Calendar size={20} />,
  'TrendingUp': <TrendingUp size={20} />,
  'Bell': <Bell size={20} />,
  'Wrench': <Wrench size={20} />
};

// Map AppSection to URL paths
const sectionToUrlMap: Record<string, string> = {
  [AppSection.Dashboard]: '/super-admin/dashboard',
  [AppSection.Projects]: '/super-admin/projects',
  [AppSection.EmployeeHub]: '/super-admin/employees',
  [AppSection.AdminHub]: '/super-admin/admin-hub',
  [AppSection.AdminRequests]: '/super-admin/requests',
  [AppSection.AuditLogs]: '/super-admin/audit-logs',
  [AppSection.Payroll]: '/super-admin/payroll',
  [AppSection.Performance]: '/super-admin/performance',
  [AppSection.Reviews]: '/super-admin/reviews',
  [AppSection.Events]: '/super-admin/events',
  [AppSection.PaymentUpdates]: '/super-admin/payments',
  [AppSection.Notifications]: '/super-admin/notifications',
  [AppSection.SystemMaintenance]: '/super-admin/system',
  [AppSection.Documents]: '/super-admin/documents',
  [AppSection.Profile]: '/super-admin/profile',
  [AppSection.AdminDetails]: '/super-admin/admin-details',
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const {
    isAuthenticated, setIsAuthenticated,
    activeSection, setActiveSection,
    globalSearch, setGlobalSearch,
    sidebarOpen, setSidebarOpen,
    mobileSidebarOpen, setMobileSidebarOpen,
    employees, admins, currentUser
  } = useApp();
  const { logout, isLoading } = useAuth();

  // Handle logout with API call
  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setShowProfileDropdown(false);
      navigate('/super-admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear localStorage and redirect even if API call fails
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
      } catch { }
      setIsAuthenticated(false);
      setShowProfileDropdown(false);
      navigate('/super-admin/login', { replace: true });
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect to login if not authenticated (but not while session is loading)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.pathname.includes('/login')) {
      navigate('/super-admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Sync active section with URL
  useEffect(() => {
    const sectionMap: Record<string, typeof AppSection[keyof typeof AppSection]> = {
      '/super-admin/dashboard': AppSection.Dashboard,
      '/super-admin/projects': AppSection.Projects,
      '/super-admin/employees': AppSection.EmployeeHub,
      '/super-admin/admin-hub': AppSection.AdminHub,
      '/super-admin/requests': AppSection.AdminRequests,
      '/super-admin/audit-logs': AppSection.AuditLogs,
      '/super-admin/payroll': AppSection.Payroll,
      '/super-admin/performance': AppSection.Performance,
      '/super-admin/reviews': AppSection.Reviews,
      '/super-admin/events': AppSection.Events,
      '/super-admin/payments': AppSection.PaymentUpdates,
      '/super-admin/notifications': AppSection.Notifications,
      '/super-admin/system': AppSection.SystemMaintenance,
      '/super-admin/documents': AppSection.Documents,
      '/super-admin/profile': AppSection.Profile,
      '/super-admin/admin-details': AppSection.AdminDetails,
    };

    const path = location.pathname.replace('/internal-site', '');
    const section = sectionMap[path];

    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [location.pathname, activeSection, setActiveSection]);

  const currentUserRole = currentUser?.role || 'EMPLOYEE';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectsApi.getAllProjects();
        const mapped: Project[] = data.map((p: any) => ({
          id: p.projectCode,
          projectCode: p.projectCode,
          name: p.name,
          status: p.status.toLowerCase().replace('_', '-'),
          progress: p.progress || 0,
          description: p.description,
          client: p.clientId != null ? String(p.clientId) : '',
          dueDate: p.endDate ? p.endDate.split('T')[0] : '',
          clientId: p.clientId,
          priority: p.priority,
          startDate: p.startDate ? p.startDate.split('T')[0] : '',
          endDate: p.endDate ? p.endDate.split('T')[0] : '',
          budget: p.budget,
          currency: p.currency,
          projectManagerId: p.projectManagerId,
        }));
        setProjects(mapped);
      } catch (err) {
        console.error('failed to load projects in App', err);
      }
    };
    load();
  }, []);

  const q = globalSearch.toLowerCase();
  const filteredEmployees = useMemo(() => employees.filter(e => !q || e.name!.toLowerCase().includes(q) || (e.designation || '').toLowerCase().includes(q)), [q, employees]);
  const filteredAdmins = useMemo(() => admins.filter(a => !q || (a.name || '').toLowerCase().includes(q) || (a.firstName || '').toLowerCase().includes(q)), [q, admins]);
  const filteredLogs = useMemo(() => MOCK_LOGS.filter(l => !q || l.action.toLowerCase().includes(q)), [q]);
  const filteredProjects = useMemo(() => projects.filter(p => !q || p.name.toLowerCase().includes(q)), [q, projects]);

  // RBAC Filtering for Sidebar
  const authorizedNavItems = useMemo(() => {
    return NAVIGATION_ITEMS.filter(item => {
      if (currentUserRole === 'SUPER_ADMIN') return true;
      // Restricted modules for lower tiers
      const restrictedForStandardAdmins = [AppSection.SystemMaintenance, AppSection.AuditLogs, AppSection.AdminRequests];
      return !restrictedForStandardAdmins.includes(item.id);
    });
  }, [currentUserRole]);

  const currentView = useMemo(() => {
    switch (activeSection) {
      case AppSection.Dashboard:
        return <DashboardView filteredEmployees={filteredEmployees} filteredAdmins={filteredAdmins} filteredProjects={filteredProjects} filteredLogs={filteredLogs} totalEmployees={employees.length} activeProjects={projects.filter(p => p.status === 'in-progress').length} />;
      case AppSection.EmployeeHub:
        return <EmployeeHub />;
      case AppSection.AdminHub:
        return <AdminHub />;
      case AppSection.AdminRequests:
        return <AdminRequests />;
      case AppSection.AuditLogs:
        return <AuditLogsView />;
      case AppSection.Payroll:
        return <PayrollView />;
      case AppSection.Projects:
        return <ProjectsView />;
      case AppSection.Performance:
        return (
          <div className="space-y-6">
            <SectionHeader title="Performance Analytics" description="Enterprise-wide high-level organization metrics." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PERFORMANCE_METRICS.map((m, idx) => (
                <StatCard key={idx} title={m.name} value={`${m.value}%`} icon={<Zap size={20} />} trend={m.trend as 'up' | 'down' | 'stable'} trendValue="+5%" />
              ))}
            </div>
          </div>
        );
      case AppSection.Reviews:
        return <ReviewsView />;
      case AppSection.Events:
        return <EventsView />;
      case AppSection.PaymentUpdates:
        return <PaymentUpdatesView />;
      case AppSection.Notifications:
        return <NotificationsView />;
      case AppSection.SystemMaintenance:
        return <SystemMaintenance />;
      case AppSection.Documents:
        return <DocumentsView />;
      case AppSection.Profile:
        return <ProfileView />;
      case AppSection.AdminDetails:
        return <AdminDetails />;
      default: return <div className="p-20 text-center text-[#9aa8bd] italic bg-[#0b1220] rounded-2xl border border-[#1f2937] flex flex-col items-center gap-4">
        <HelpCircle size={48} className="text-[#1f2937]" />
        <div>Module "{(activeSection as string).toUpperCase()}" content coming in the next release.</div>
      </div>;
    }
  }, [activeSection, filteredEmployees, filteredAdmins, filteredProjects, filteredLogs, employees]);

  // Redirect happens in useEffect above if not authenticated

  const SidebarContent = () => (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ backgroundColor: '#2c3e50' }}>
      <div className="p-6 border-b shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black shrink-0">S</div>
          {(sidebarOpen || mobileSidebarOpen) && <span className="text-white font-bold text-xl tracking-tight truncate">Super Admin</span>}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {authorizedNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const url = sectionToUrlMap[item.id];
              if (url) {
                navigate(url);
              }
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
              activeSection === item.id 
                ? 'text-white font-semibold' 
                : 'text-white/70 hover:text-white'
            }`}
            style={activeSection === item.id ? { backgroundColor: '#c97a4c' } : {}}
          >
            <span className="shrink-0">{iconMap[item.iconName] || <HelpCircle size={20} />}</span>
            {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-4 w-full px-3 py-3 rounded-xl transition-all font-bold text-white hover:bg-opacity-80"
          style={{ backgroundColor: '#c97a4c' }}
        >
          <LogOut size={20} />
          {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex text-gray-900 overflow-x-hidden selection:bg-blue-300" style={{ backgroundColor: '#f5ede3' }}>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] lg:hidden animate-in fade-in duration-300" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[90] w-72 transform transition-transform duration-500 ease-in-out lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-50 transition-all duration-300 flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{ backgroundColor: '#2c3e50' }}>
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pt-16 sm:pt-20 lg:pt-20 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className={`h-16 sm:h-20 flex items-center px-3 sm:px-6 lg:px-8 justify-between fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${sidebarOpen ? 'lg:left-64' : 'lg:left-20'}`} style={{ backgroundColor: '#2c3e50', borderBottom: '1px solid #1a252f' }}>
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar" className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors shrink-0">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <button onClick={() => setMobileSidebarOpen(true)} title="Open sidebar" className="lg:hidden p-2 hover:bg-[#1f2937] rounded-xl text-[#9aa8bd] transition-colors shrink-0"><Menu size={20} /></button>
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 border-0 px-2 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl flex-1 min-w-0 max-w-xs sm:max-w-lg lg:max-w-3xl focus-within:ring-4 focus-within:ring-blue-500/50 transition-all">
              <Search size={16} className="text-slate-400 shrink-0 sm:w-[18px] lg:w-5" />
              <input
                type="text"
                placeholder="Search across authorized modules..."
                className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm lg:text-base w-full text-slate-700 outline-none placeholder-slate-500 min-w-0"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 ml-2 sm:ml-4 lg:ml-6 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-orange-400 rounded-lg border-0 whitespace-nowrap">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.7)]"></div>
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest">Production Node</span>
            </div>
            <button
              onClick={() => navigate(sectionToUrlMap[AppSection.Notifications])}
              title="View notifications"
              className="relative p-2 sm:p-2.5 lg:p-3 text-slate-300 hover:bg-slate-700 rounded-xl transition-all shrink-0"
            >
              <Bell size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="absolute top-1.5 sm:top-2.5 lg:top-3 right-1.5 sm:right-2.5 lg:right-3 w-2 h-2 bg-orange-500 rounded-full ring-3 sm:ring-4 lg:ring-5 ring-white animate-bounce"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 sm:gap-3 lg:gap-4 rounded-2xl px-2 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 hover:bg-slate-700 transition-all shrink-0"
              >
                <div className="hidden md:flex flex-col items-end gap-0">
                  <p className="text-xs lg:text-sm font-bold text-white leading-none">{currentUser?.name || 'Super Admin'}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] lg:text-xs text-slate-300 font-black uppercase tracking-widest">Active</p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#c97a4c' }}>
                  {(currentUser?.name || 'Super Admin').charAt(0).toUpperCase()}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs font-black text-slate-900 truncate">{currentUser?.email || 'admin@example.com'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Super Admin Portal</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(sectionToUrlMap[AppSection.Profile]);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4" /> View Full Profile
                  </button>
                  <div className="border-t border-slate-50 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4" /> End Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-3 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 max-w-screen-2xl mx-auto w-full overflow-x-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {currentView}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => <AppContent />;

export default App;