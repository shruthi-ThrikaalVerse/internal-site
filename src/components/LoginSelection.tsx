import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginSelection: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<'employee' | 'admin' | 'super_admin' | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure theme is loaded before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmployeeLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/employee/login');
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/admin/login');
  };

  const handleSuperAdminLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/super-admin/login');
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/');
  };

  // Animation variants for container - Fixed TypeScript types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  // Animation variants for cards - Fixed TypeScript types
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const, // Fixed: use 'as const' for literal type
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Don't render until mounted to prevent theme flash
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent-teal)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements with fixed colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/5 to-transparent blur-3xl -top-20 -left-20"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-red-500/5 to-transparent blur-3xl -bottom-20 -right-20"
        />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={handleBack}
        className="absolute top-6 left-6 p-3 rounded-full bg-[var(--bg-secondary)]/80 backdrop-blur-sm border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-50 shadow-lg"
        title="Back to Home"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4"
          >
            Welcome to Thrikaal Verse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--text-secondary)]"
          >
            Select your role to continue
          </motion.p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 px-4 items-stretch"
        >
          {/* Employee Card */}
          <motion.div variants={cardVariants}>
            <div
              onClick={(e) => handleEmployeeLogin(e)}
              onMouseEnter={() => setHoveredCard('employee')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-2xl"
                animate={{
                  opacity: hoveredCard === 'employee' ? 0.8 : 0.3,
                  scale: hoveredCard === 'employee' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <motion.div
                  className="mb-6"
                  animate={{
                    scale: hoveredCard === 'employee' ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
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
                </motion.div>

                {/* Content */}
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Employee Portal
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center mb-6">
                  Access your dashboard, view attendance, manage leaves, and track performance.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Dashboard & Analytics
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>Leave Management</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>Performance Tracking</span>
                  </li>
                </ul>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleEmployeeLogin(e)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                  Login as Employee
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Admin Card */}
          <motion.div variants={cardVariants}>
            <div
              onClick={(e) => handleAdminLogin(e)}
              onMouseEnter={() => setHoveredCard('admin')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 blur-2xl"
                animate={{
                  opacity: hoveredCard === 'admin' ? 0.8 : 0.3,
                  scale: hoveredCard === 'admin' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <motion.div
                  className="mb-6"
                  animate={{
                    scale: hoveredCard === 'admin' ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
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
                </motion.div>

                {/* Content */}
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Admin Portal
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center mb-6">
                  Manage employees, payroll, leave approvals, and organizational operations.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Employee Management
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>Payroll & Finance</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>System Administration</span>
                  </li>
                </ul>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleAdminLogin(e)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                >
                  Login as Admin
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Super Admin Card */}
          <motion.div variants={cardVariants}>
            <div
              onClick={(e) => handleSuperAdminLogin(e)}
              onMouseEnter={() => setHoveredCard('super_admin')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-pointer h-full w-full"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 blur-2xl"
                animate={{
                  opacity: hoveredCard === 'super_admin' ? 0.8 : 0.3,
                  scale: hoveredCard === 'super_admin' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
              <div className="relative bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-2xl p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col w-full">
                {/* Icon */}
                <motion.div
                  className="mb-6"
                  animate={{
                    scale: hoveredCard === 'super_admin' ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
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
                </motion.div>

                {/* Content */}
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
                  Super Admin Portal
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center mb-6">
                  Full access to all systems, enterprise settings, audits, and strategic management.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    System Maintenance
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                    <span>Audit Management</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                    <span>Enterprise Control</span>
                  </li>
                </ul>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleSuperAdminLogin(e)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  Login as Super Admin
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-sm text-[var(--text-secondary)] mt-12"
        >
          Don't have an account? Contact the administrator for access.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginSelection;