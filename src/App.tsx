
import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { ThemeProvider } from './components/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { HRMSProvider } from './context/HRMSContext.tsx';
import { LeaveProvider } from './context/LeaveContext.tsx';

// Public Components
import Navbar from './components/Navbar.tsx';
import Hero3D from './components/Hero3D.tsx';
import About from './components/About.tsx';
import Projects from './components/Projects.tsx';
import Team from './components/Team.tsx';
import Media from './components/Media.tsx';
import Contact from './components/Contact.tsx';
import Career from './components/career.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import LoginSelection from './components/LoginSelection.tsx';
import Footer from './components/Footer.tsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.tsx';
import EmployeeHub from './pages/admin/EmployeeHub.tsx';
import DocumentManagement from './pages/admin/DocumentManagement.tsx';
import AttendanceMonitor from './pages/admin/AttendanceMonitor.tsx';
import LeaveCenterAdmin from './pages/admin/LeaveCenter.tsx';
import TasksAdmin from './pages/admin/Tasks.tsx';
import EventsAdmin from './pages/admin/EventsAdmin.tsx';
import NotificationsAdmin from './pages/admin/NotificationsAdmin.tsx';
import PayrollProcessing from './pages/admin/PayrollProcessing.tsx';
import PayslipsAdmin from './pages/admin/PayslipsAdmin.tsx';
import PerformanceManagement from './pages/admin/PerformanceManagement.tsx';
import ProfileAdmin from './pages/admin/Profile.tsx';
import AuditLogsPage from './pages/admin/AuditLogs.tsx';
import LoginPageAdmin from './pages/admin/Login.tsx';
import RegisterPageAdmin from './pages/admin/Register.tsx';

// Admin Components
import LayoutWrapper from './components/admin/LayoutWrapper.tsx';
import { ProtectedRoute, PublicRoute } from './components/admin/RouteGuards.tsx';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard.tsx';
import EmployeeLeave from './pages/employee/Leave.tsx';
import Attendance from './pages/employee/Attendance.tsx';
import Calendar from './pages/employee/Calendar.tsx';
import Documents from './pages/employee/Documents.tsx';
import Notifications from './pages/employee/Notifications.tsx';
import Payroll from './pages/employee/Payroll.tsx';
import Performance from './pages/employee/Performance.tsx';
import ProfileEmployee from './pages/employee/Profile.tsx';
import Requests from './pages/employee/Requests.tsx';
import TasksEmployee from './pages/employee/Tasks.tsx';
import Events from './pages/employee/Events.tsx';
import LoginPageEmployee from './pages/employee/Login.tsx';

// Employee Components
import EmployeeLayout from './components/employee/Layout.tsx';

// ============= Layout Wrappers with Logout Handlers =============
const AdminLayoutWrapper: React.FC<{ children: React.ReactNode; onLogout: () => Promise<void> }> = ({
  children,
  onLogout: handleLogout
}) => {
  React.useEffect(() => {
    // Make logout available globally for components
    (window as any).__handleLogout = handleLogout;
  }, [handleLogout]);

  return <LayoutWrapper>{children}</LayoutWrapper>;
};

const EmployeeLayoutWrapper: React.FC<{ children: React.ReactNode; onLogout: () => Promise<void> }> = ({
  children,
  onLogout: handleLogout
}) => {
  React.useEffect(() => {
    // Make logout available globally for components
    (window as any).__handleLogout = handleLogout;
  }, [handleLogout]);

  return (
    <EmployeeLayout onLogout={handleLogout}>
      {children}
    </EmployeeLayout>
  );
};

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  logout?: () => void;
}

const AppRouter: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (auth?.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-5xl px-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded mb-6" />

            <div className="flex gap-6">
              <div className="w-64 space-y-4">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-48 bg-slate-200 rounded mt-4" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="h-24 bg-slate-200 rounded" />
                  <div className="h-24 bg-slate-200 rounded" />
                  <div className="h-24 bg-slate-200 rounded" />
                </div>
                <div className="h-4 bg-slate-200 rounded mt-6" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8085/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('HRMS_AUTH_SESSION_V1');
      auth?.logout?.();
      toast.info('Logged out successfully. See you soon!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/');
    }
  };

  return (
    <>
      {(location.pathname === '/' || location.pathname === '/#/') && (
        <>
          <Navbar />
          <ScrollToTop />
        </>
      )}

      <Routes>
        {/* Public Landing Page - Always accessible */}
        <Route
          path="/"
          element={
            <div className="relative min-h-screen transition-colors duration-500 bg-[var(--bg-primary)] text-[var(--text-primary)]">
              <main>
                <section id="home">
                  <Hero3D />
                </section>
                <section id="about" className="py-24 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]">
                  <About />
                </section>
                <section id="projects" className="py-24 bg-[var(--bg-secondary)]">
                  <Projects />
                </section>
                <section id="team" className="py-24 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                  <Team />
                </section>
                <section id="media" className="py-24 bg-[var(--bg-primary)]">
                  <Media />
                </section>
                <section id="career" className="py-24 bg-[var(--bg-primary)]">
                  <Career />
                </section>
                <section id="contact" className="py-24 bg-gradient-to-t from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                  <Contact />
                </section>
                <Footer />
              </main>
            </div>
          }
        />

        {/* Login Selection Page */}
        <Route path="/login-selection" element={<LoginSelection />} />

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<LoginPageAdmin />} />
        <Route path="/admin/register" element={<RegisterPageAdmin />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/*"
          element={
            auth?.isAuthenticated && (auth?.user?.role === 'admin' || auth?.user?.role === 'manager') ? (
              <AdminLayoutWrapper onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="employees" element={<EmployeeHub />} />
                  <Route path="documents" element={<DocumentManagement />} />
                  <Route path="attendance" element={<AttendanceMonitor />} />
                  <Route path="leave" element={<LeaveCenterAdmin />} />
                  <Route path="tasks" element={<TasksAdmin />} />
                  <Route path="events" element={<EventsAdmin />} />
                  <Route path="notifications" element={<NotificationsAdmin />} />
                  <Route path="payroll" element={<PayrollProcessing />} />
                  <Route path="payslips" element={<PayslipsAdmin />} />
                  <Route path="performance" element={<PerformanceManagement />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route path="profile" element={<ProfileAdmin />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayoutWrapper>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Employee Auth Route */}
        <Route path="/employee/login" element={<LoginPageEmployee />} />

        {/* Employee Dashboard Routes */}
        <Route
          path="/employee/*"
          element={
            auth?.isAuthenticated && auth?.user?.role !== 'admin' && auth?.user?.role !== 'manager' ? (
              <EmployeeLayoutWrapper onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="leave" element={<EmployeeLeave />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="payroll" element={<Payroll />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="profile" element={<ProfileEmployee />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="tasks" element={<TasksEmployee />} />
                  <Route path="events" element={<Events />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </EmployeeLayoutWrapper>
            ) : (
              <Navigate to="/employee/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HRMSProvider>
          <LeaveProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              aria-label="Notification messages"
            />
            <AppRouter />
          </LeaveProvider>
        </HRMSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};


export default App;