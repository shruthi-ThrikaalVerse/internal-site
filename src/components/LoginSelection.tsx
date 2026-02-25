import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginSelection: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<'employee' | 'admin' | 'super_admin' | null>(null);

  const handleEmployeeLogin = () => {
    navigate('/employee/login');
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  const handleSuperAdminLogin = () => {
    navigate('/super-admin/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: '24rem',
            height: '24rem',
            borderRadius: '9999px',
            background: 'linear-gradient(to right bottom, rgba(59, 130, 246, 0.1), transparent)',
            filter: 'blur(48px)',
            top: '-20%',
            left: '-10%'
          }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: '24rem',
            height: '24rem',
            borderRadius: '9999px',
            background: 'linear-gradient(to right bottom, rgba(239, 68, 68, 0.1), transparent)',
            filter: 'blur(48px)',
            bottom: '-20%',
            right: '-10%'
          }}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10"
        title="Back to Home"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '56rem' }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Welcome to Thrikaal Verse
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-lg text-[var(--text-secondary)]">
              Select your role to continue
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 px-4 items-stretch">
          {/* Employee Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div
              onClick={handleEmployeeLogin}
              onMouseEnter={() => setHoveredCard('employee')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '1rem',
                  background: 'linear-gradient(to right bottom, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                  filter: 'blur(24px) ',
                  transition: 'all 300ms'
                }}
                animate={{
                  opacity: hoveredCard === 'employee' ? 1 : 0.5,
                  scale: hoveredCard === 'employee' ? 1.05 : 1,
                }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <div
                  className="mb-6"
                  style={{
                    transform: hoveredCard === 'employee' ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Employee Portal
                </h2>
                <p className="text-[var(--text-secondary)] text-center mb-6">
                  Access your dashboard, view attendance, manage leaves, and track performance.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Dashboard & Analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Leave Management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Performance Tracking
                  </li>
                </ul>

                {/* Button */}
                <button
                  onClick={handleEmployeeLogin}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'block' }}
                  >
                    Login as Employee
                  </motion.span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Admin Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div
              onClick={handleAdminLogin}
              onMouseEnter={() => setHoveredCard('admin')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '1rem',
                  background: 'linear-gradient(to right bottom, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                  filter: 'blur(24px)',
                  transition: 'all 300ms'
                }}
                animate={{
                  opacity: hoveredCard === 'admin' ? 1 : 0.5,
                  scale: hoveredCard === 'admin' ? 1.05 : 1,
                }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <div
                  className="mb-6"
                  style={{
                    transform: hoveredCard === 'admin' ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Admin Portal
                </h2>
                <p className="text-[var(--text-secondary)] text-center mb-6">
                  Manage employees, payroll, leave approvals, and organizational operations.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Employee Management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Payroll & Finance
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    System Administration
                  </li>
                </ul>

                {/* Button */}
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'block' }}
                  >
                    Login as Admin
                  </motion.span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Super Admin Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div
              onClick={handleSuperAdminLogin}
              onMouseEnter={() => setHoveredCard('super_admin')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '1rem',
                  background: 'linear-gradient(to right bottom, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
                  filter: 'blur(24px)',
                  transition: 'all 300ms'
                }}
                animate={{
                  opacity: hoveredCard === 'super_admin' ? 1 : 0.5,
                  scale: hoveredCard === 'super_admin' ? 1.05 : 1,
                }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <div
                  className="mb-6"
                  style={{
                    transform: hoveredCard === 'super_admin' ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Super Admin Portal
                </h2>
                <p className="text-[var(--text-secondary)] text-center mb-6">
                  Full access to all systems, enterprise settings, audits, and strategic management.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    System Maintenance
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Audit Management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Enterprise Control
                  </li>
                </ul>

                {/* Button */}
                <button
                  onClick={handleSuperAdminLogin}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'block' }}
                  >
                    Login as Super Admin
                  </motion.span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginTop: '3rem'
          }}
        >
          Don't have an account? Contact the administrator for access.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginSelection;
