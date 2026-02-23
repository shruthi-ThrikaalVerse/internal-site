import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import './index.css';
import LoginSelection from './components/LoginSelection';

// Landing page components
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import About from './components/About';
import Projects from './components/Projects';
import Media from './components/Media';
import career from './components/career';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './components/ThemeContext';

// Employee login and dashboard
import EmployeeLogin from './pages/employee/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeLayout from './components/employee/Layout';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeCalendar from './pages/employee/Calendar';
import EmployeeLeave from './pages/employee/Leave';
import EmployeePayroll from './pages/employee/Payroll';
import EmployeeTasks from './pages/employee/Tasks';
import EmployeePerformance from './pages/employee/Performance';
import EmployeeDocuments from './pages/employee/Documents';
import EmployeeRequests from './pages/employee/Requests';
import EmployeeEvents from './pages/employee/Events';
import EmployeeNotifications from './pages/employee/Notifications';
import EmployeeProfile from './pages/employee/Profile';

// Admin login and dashboard
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLayoutWrapper from './components/admin/LayoutWrapper';
import AdminAttendanceMonitor from './pages/admin/AttendanceMonitor';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminDocumentManagement from './pages/admin/DocumentManagement';
import AdminEmployeeHub from './pages/admin/EmployeeHub';
import AdminEventsAdmin from './pages/admin/EventsAdmin';
import AdminLeaveCenter from './pages/admin/LeaveCenter';
import AdminNotificationsAdmin from './pages/admin/NotificationsAdmin';
import AdminPayrollProcessing from './pages/admin/PayrollProcessing';
import AdminPayslipsAdmin from './pages/admin/PayslipsAdmin';
import AdminPerformanceManagement from './pages/admin/PerformanceManagement';
import AdminProfile from './pages/admin/Profile';
import AdminRequests from './pages/admin/Requests';
import AdminTasks from './pages/admin/Tasks';

// Super Admin
import { LoginView as SuperAdminLogin } from './pages/super_admin/LoginView';

// Contexts
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import { HRMSProvider } from './context/HRMSContext';

// Landing Page Component
const LandingPageContent = () => (
  <ThemeProvider>
    <ScrollToTop />
    <Navbar />
    <main>
      <section id="home"><Hero3D /></section>
      <section id="about"><About /></section>
      <section id="projects"><Projects /></section>
      <section id="media"><Media /></section>
      <section id="career"><career /></section>
      <section id="contact"><Contact /></section>
    </main>
    <Footer />
  </ThemeProvider>
);

// Public Route Guard - redirects authenticated users to appropriate dashboard
const PublicRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to employee dashboard by default
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <>{children}</>;
};

const LandingPage = () => (
  <PublicRouteGuard>
    <LandingPageContent />
  </PublicRouteGuard>
);

// Employee Protected Route Guard
const EmployeeProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = React.useRef(useNavigate()).current;

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/employee/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

// Helper component for employee pages with logout
const EmployeePageWithLogout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/employee/login', { replace: true });
  };

  return (
    <EmployeeProtectedRoute>
      <LeaveProvider>
        <EmployeeLayout onLogout={handleLogout}>
          {children}
        </EmployeeLayout>
      </LeaveProvider>
    </EmployeeProtectedRoute>
  );
};

// Admin Protected Route Guard
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = React.useRef(useNavigate()).current;

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

// Helper component for admin pages with logout
const AdminPageWithLogout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/admin/login', { replace: true });
  };

  return (
    <AdminProtectedRoute>
      <HRMSProvider>
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </HRMSProvider>
    </AdminProtectedRoute>
  );
};

// Employee page components
const EmployeeDashboardWithContext = () => (
  <EmployeePageWithLogout>
    <EmployeeDashboard />
  </EmployeePageWithLogout>
);

// Employee page wrappers
const EmployeeAttendancePage = () => (
  <EmployeePageWithLogout>
    <EmployeeAttendance />
  </EmployeePageWithLogout>
);

const EmployeeCalendarPage = () => (
  <EmployeePageWithLogout>
    <EmployeeCalendar />
  </EmployeePageWithLogout>
);

const EmployeeLeavePage = () => (
  <EmployeePageWithLogout>
    <EmployeeLeave />
  </EmployeePageWithLogout>
);

const EmployeePayrollPage = () => (
  <EmployeePageWithLogout>
    <EmployeePayroll />
  </EmployeePageWithLogout>
);

const EmployeeTasksPage = () => (
  <EmployeePageWithLogout>
    <EmployeeTasks />
  </EmployeePageWithLogout>
);

const EmployeePerformancePage = () => (
  <EmployeePageWithLogout>
    <EmployeePerformance />
  </EmployeePageWithLogout>
);

const EmployeeDocumentsPage = () => (
  <EmployeePageWithLogout>
    <EmployeeDocuments />
  </EmployeePageWithLogout>
);

const EmployeeRequestsPage = () => (
  <EmployeePageWithLogout>
    <EmployeeRequests />
  </EmployeePageWithLogout>
);

const EmployeeEventsPage = () => (
  <EmployeePageWithLogout>
    <EmployeeEvents />
  </EmployeePageWithLogout>
);

const EmployeeNotificationsPage = () => (
  <EmployeePageWithLogout>
    <EmployeeNotifications />
  </EmployeePageWithLogout>
);

const EmployeeProfilePage = () => (
  <EmployeePageWithLogout>
    <EmployeeProfile />
  </EmployeePageWithLogout>
);

// Admin page components
const AdminDashboardWithContext = () => (
  <AdminPageWithLogout>
    <AdminDashboard />
  </AdminPageWithLogout>
);

// Admin page wrappers
const AdminAttendanceMonitorPage = () => (
  <AdminPageWithLogout>
    <AdminAttendanceMonitor />
  </AdminPageWithLogout>
);

const AdminAuditLogsPage = () => (
  <AdminPageWithLogout>
    <AdminAuditLogs />
  </AdminPageWithLogout>
);

const AdminDocumentManagementPage = () => (
  <AdminPageWithLogout>
    <AdminDocumentManagement />
  </AdminPageWithLogout>
);

const AdminEmployeeHubPage = () => (
  <AdminPageWithLogout>
    <AdminEmployeeHub />
  </AdminPageWithLogout>
);

const AdminEventPage = () => (
  <AdminPageWithLogout>
    <AdminEventsAdmin />
  </AdminPageWithLogout>
);

const AdminLeaveCenterPage = () => (
  <AdminPageWithLogout>
    <AdminLeaveCenter />
  </AdminPageWithLogout>
);

const AdminNotificationsPage = () => (
  <AdminPageWithLogout>
    <AdminNotificationsAdmin />
  </AdminPageWithLogout>
);

const AdminPayrollProcessingPage = () => (
  <AdminPageWithLogout>
    <AdminPayrollProcessing />
  </AdminPageWithLogout>
);

const AdminPayslipsPage = () => (
  <AdminPageWithLogout>
    <AdminPayslipsAdmin />
  </AdminPageWithLogout>
);

const AdminPerformanceManagementPage = () => (
  <AdminPageWithLogout>
    <AdminPerformanceManagement />
  </AdminPageWithLogout>
);

const AdminProfilePage = () => (
  <AdminPageWithLogout>
    <AdminProfile />
  </AdminPageWithLogout>
);

const AdminRequestsPage = () => (
  <AdminPageWithLogout>
    <AdminRequests />
  </AdminPageWithLogout>
);

const AdminTasksPage = () => (
  <AdminPageWithLogout>
    <AdminTasks />
  </AdminPageWithLogout>
);

// Login Route Guards - prevent access if already authenticated
const EmployeeLoginGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <EmployeeLogin />;
};

const AdminLoginGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <AdminLogin />;
};

const LoginSelectionGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <LoginSelection />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <AuthProvider>
          <Routes>
            {/* Default landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Login selection page */}
            <Route path="/login-selection" element={<LoginSelectionGuard />} />

            {/* Employee routes */}
            <Route path="/employee/login" element={<EmployeeLoginGuard />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboardWithContext />} />
            <Route path="/employee/attendance" element={<EmployeeAttendancePage />} />
            <Route path="/employee/calendar" element={<EmployeeCalendarPage />} />
            <Route path="/employee/leave" element={<EmployeeLeavePage />} />
            <Route path="/employee/payroll" element={<EmployeePayrollPage />} />
            <Route path="/employee/tasks" element={<EmployeeTasksPage />} />
            <Route path="/employee/performance" element={<EmployeePerformancePage />} />
            <Route path="/employee/documents" element={<EmployeeDocumentsPage />} />
            <Route path="/employee/requests" element={<EmployeeRequestsPage />} />
            <Route path="/employee/events" element={<EmployeeEventsPage />} />
            <Route path="/employee/notifications" element={<EmployeeNotificationsPage />} />
            <Route path="/employee/profile" element={<EmployeeProfilePage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginGuard />} />
            <Route path="/admin/dashboard" element={<AdminDashboardWithContext />} />
            <Route path="/admin/attendance-monitor" element={<AdminAttendanceMonitorPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/document-management" element={<AdminDocumentManagementPage />} />
            <Route path="/admin/employee-hub" element={<AdminEmployeeHubPage />} />
            <Route path="/admin/events" element={<AdminEventPage />} />
            <Route path="/admin/leave-center" element={<AdminLeaveCenterPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/payroll-processing" element={<AdminPayrollProcessingPage />} />
            <Route path="/admin/payslips" element={<AdminPayslipsPage />} />
            <Route path="/admin/performance-management" element={<AdminPerformanceManagementPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
            <Route path="/admin/tasks" element={<AdminTasksPage />} />

            {/* Super Admin */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />
            <Route path="/super-admin/*" element={<App />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AppProvider>
    </Router>
  </React.StrictMode>
);
