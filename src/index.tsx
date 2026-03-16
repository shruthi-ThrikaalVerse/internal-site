import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import './index.css';
import LoginSelection from './components/LoginSelection.tsx';

// Landing page components
import Navbar from './components/Navbar.tsx';
import Hero3D from './components/Hero3D.tsx';
import About from './components/About.tsx';
import Projects from './components/Projects.tsx';
import Media from './components/Media.tsx';
import Career from './components/career.tsx';
import Contact from './components/Contact.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import { ThemeProvider } from './components/ThemeContext.tsx';

// Employee login and dashboard
import EmployeeLogin from './pages/employee/Login.tsx';
import EmployeeDashboard from './pages/employee/Dashboard.tsx';
import EmployeeLayout from './components/employee/Layout.tsx';
import EmployeeAttendance from './pages/employee/Attendance.tsx';
import EmployeeCalendar from './pages/employee/Calendar.tsx';
import EmployeeLeave from './pages/employee/Leave.tsx';
import EmployeePayroll from './pages/employee/Payroll.tsx';
import EmployeeTasks from './pages/employee/Tasks.tsx';
import EmployeePerformance from './pages/employee/Performance.tsx';
import EmployeeDocuments from './pages/employee/Documents.tsx';
import EmployeeRequests from './pages/employee/Requests.tsx';
import EmployeeEvents from './pages/employee/Events.tsx';
import EmployeeNotifications from './pages/employee/Notifications.tsx';
import EmployeeProfile from './pages/employee/Profile.tsx';
import EmployeeResignation from './pages/employee/Resignation.tsx';

import AdminLogin from './pages/admin/Login.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminAttendanceComponent from './pages/admin/AdminAttendance.tsx';
import AdminCalendar from './pages/admin/AdminCalendar.tsx';
import AdminLayoutWrapper from './components/admin/LayoutWrapper.tsx';
import AdminAttendanceMonitor from './pages/admin/AttendanceMonitor.tsx';
import AdminAuditLogs from './pages/admin/AuditLogs.tsx';
import AdminDocumentManagement from './pages/admin/DocumentManagement.tsx';
import AdminDocuments from './pages/admin/Documents.tsx';
import AdminEmployeeHub from './pages/admin/EmployeeHub.tsx';
import AdminEmployeeDetails from './pages/admin/EmployeeDetails.tsx';
import AdminEventsAdmin from './pages/admin/EventsAdmin.tsx';
import AdminLeaveCenter from './pages/admin/LeaveCenter.tsx';
import AdminLeave from './pages/admin/AdminLeave.tsx';
import AdminProjects from './pages/admin/Projects.tsx';
import AdminNotificationsAdmin from './pages/admin/NotificationsAdmin.tsx';
import AdminPayrollProcessing from './pages/admin/PayrollProcessing.tsx';
import AdminPayslipsAdmin from './pages/admin/PayslipsAdmin.tsx';
import AdminPerformanceManagement from './pages/admin/PerformanceManagement.tsx';
import AdminPerformanceReviews from './pages/admin/AdminPerformanceReviews.tsx';
import AdminProfile from './pages/admin/Profile.tsx';
import AdminRequests from './pages/admin/Requests.tsx';
import AdminTasks from './pages/admin/Tasks.tsx';
import AdminResignation from './pages/admin/Resignation.tsx';

// Super Admin
import { LoginView as SuperAdminLogin } from './pages/super_admin/LoginView.tsx';

// Contexts
import { AppProvider } from './context/AppContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LeaveProvider } from './context/LeaveContext.tsx';
import { HRMSProvider } from './context/HRMSContext.tsx';


// Landing Page Component
const LandingPageContent = () => (
  <>
    <ScrollToTop />
    <Navbar />
    <main>
      <section id="home"><Hero3D /></section>
      <section id="about"><About /></section>
      <section id="projects"><Projects /></section>
      <section id="media"><Media /></section>
      <section id="career"><Career /></section>
      <section id="contact"><Contact /></section>
    </main>
    <Footer />
  </>
);

// Public Route Guard - redirects authenticated users to appropriate dashboard
const PublicRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin/dashboard', { replace: true });
          break;
        case 'admin':
        case 'manager':
        case 'auditor':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'employee':
        default:
          navigate('/employee/dashboard', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

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

const EmployeeResignationPage = () => (
  <EmployeePageWithLogout>
    <EmployeeResignation />
  </EmployeePageWithLogout>
);

// Admin page components
const AdminDashboardWithContext = () => (
  <AdminPageWithLogout>
    <AdminDashboard />
  </AdminPageWithLogout>
);

const AdminAttendance = () => (
  <AdminPageWithLogout>
    <AdminAttendanceComponent />
  </AdminPageWithLogout>
);

const AdminCalendarPage = () => (
  <AdminPageWithLogout>
    <AdminCalendar />
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

const AdminEmployeeDetailsPage = () => (
  <AdminPageWithLogout>
    <AdminEmployeeDetails />
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

const AdminPerformanceReviewsPage = () => (
  <AdminPageWithLogout>
    <AdminPerformanceReviews />
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

const AdminResignationPage = () => (
  <AdminPageWithLogout>
    <AdminResignation />
  </AdminPageWithLogout>
);

const AdminLeaveRequestsPage = () => (
  <AdminPageWithLogout>
    <AdminLeaveCenter />
  </AdminPageWithLogout>
);

const AdminPayrollPage = () => (
  <AdminPageWithLogout>
    <AdminPayrollProcessing />
  </AdminPageWithLogout>
);

const AdminPerformancePage = () => (
  <AdminPageWithLogout>
    <AdminPerformanceManagement />
  </AdminPageWithLogout>
);

const AdminAttendancePageDirect = () => (
  <AdminPageWithLogout>
    <AdminAttendanceMonitor />
  </AdminPageWithLogout>
);

// Login Route Guards - prevent access if already authenticated
const EmployeeLoginGuard = () => {
  const { isLoading } = useAuth();
  const navigate = useNavigate();

  // Clear any existing auth state when visiting the employee login page
  React.useEffect(() => {
    try { localStorage.removeItem('user'); } catch { }
    try { localStorage.removeItem('authToken'); } catch { }
  }, []);

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
  const { isLoading } = useAuth();
  const navigate = useNavigate();

  // Clear any existing auth state when visiting the admin login page
  React.useEffect(() => {
    try { localStorage.removeItem('user'); } catch { }
    try { localStorage.removeItem('authToken'); } catch { }
  }, []);

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
  const { isLoading } = useAuth();

  // Clear any existing auth state when visiting the login selection page
  React.useEffect(() => {
    try { localStorage.removeItem('user'); } catch { }
    try { localStorage.removeItem('authToken'); } catch { }
  }, []);

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
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
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
              <Route path="/employee/notifications/:id" element={<EmployeeNotificationsPage />} />
              <Route path="/employee/resignation" element={<EmployeeResignationPage />} />
              <Route path="/employee/profile" element={<EmployeeProfilePage />} />



              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginGuard />} />
              <Route path="/admin/dashboard" element={<AdminDashboardWithContext />} />
              <Route path="/admin/attendance" element={<AdminAttendancePageDirect />} />
              <Route path="/admin/adminattendance" element={<AdminAttendance />} />
              <Route path="/admin/calendar" element={<AdminCalendarPage />} />
              <Route path="/admin/attendance-monitor" element={<AdminAttendanceMonitorPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="/admin/document-management" element={<AdminDocumentManagementPage />} />

              {/* Admin Documents page with My Documents button/modal */}
              <Route path="/admin/documents" element={<AdminPageWithLogout><HRMSProvider><AdminDocuments /></HRMSProvider></AdminPageWithLogout>} />
              <Route path="/admin/employee-hub" element={<AdminEmployeeHubPage />} />
              <Route path="/admin/employee-hub/:id" element={<AdminEmployeeDetailsPage />} />
              <Route path="/admin/events" element={<AdminEventPage />} />
              <Route path="/admin/leave-center" element={<AdminLeaveCenterPage />} />
              <Route path="/admin/leave" element={<AdminPageWithLogout><LeaveProvider><AdminLeave /></LeaveProvider></AdminPageWithLogout>} />
              <Route path="/admin/leave-requests" element={<AdminLeaveRequestsPage />} />
              <Route path="/admin/projects" element={<AdminPageWithLogout><AdminProjects /></AdminPageWithLogout>} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/payroll" element={<AdminPayrollPage />} />
              <Route path="/admin/payroll-processing" element={<AdminPayrollProcessingPage />} />
              <Route path="/admin/payslips" element={<AdminPayslipsPage />} />
              <Route path="/admin/performance" element={<AdminPerformancePage />} />
              <Route path="/admin/performance-management" element={<AdminPerformanceManagementPage />} />
              <Route path="/admin/performance-reviews" element={<AdminPerformanceReviewsPage />} />
              <Route path="/admin/profile" element={<AdminProfilePage />} />
              <Route path="/admin/requests" element={<AdminRequestsPage />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/resignation" element={<AdminResignationPage />} />

              {/* Super Admin */}
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route path="/super-admin/attendance-monitor" element={<HRMSProvider><AppProvider><App /></AppProvider></HRMSProvider>} />
              <Route path="/super-admin/*" element={<HRMSProvider><App /></HRMSProvider>} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
