import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginSelection: React.FC<LoginSelectionProps> = ({ isOpen, onClose }) => {
  const handleEmployeeLogin = () => {
    // Navigate to employee login - adjust URL based on your deployment setup
    window.location.href = "http://localhost:5173"; // Employee app URL
    onClose();
  };

  const handleAdminLogin = () => {
    // Navigate to admin login - adjust URL based on your deployment setup
    window.location.href = "http://localhost:5174"; // Admin app URL
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // @ts-ignore - Framer Motion TypeScript compatibility issue
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTap={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer'
          } as any}
        >
          {/* @ts-ignore - Framer Motion TypeScript compatibility issue */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onTap={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              cursor: 'default',
              maxWidth: '28rem',
              width: '100%',
              marginX: '1rem'
            } as any}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Welcome to Thrikaal Verse
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Select your login type to continue
                </p>
              </div>

              {/* Login Options */}
              <div className="space-y-4">
                {/* Employee Login Button */}
                {/* @ts-ignore - Framer Motion TypeScript compatibility issue */}
                <motion.button
                  onTap={handleEmployeeLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: '2px solid var(--border-color)',
                    transition: 'all 300ms',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  } as any}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500"
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
                    <span className="font-semibold text-[var(--text-primary)]">
                      Login as Employee
                    </span>
                  </div>
                </motion.button>

                {/* Admin Login Button */}
                {/* @ts-ignore - Framer Motion TypeScript compatibility issue */}
                <motion.button
                  onTap={handleAdminLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: '2px solid var(--border-color)',
                    transition: 'all 300ms',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  } as any}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    <span className="font-semibold text-[var(--text-primary)]">
                      Login as Admin
                    </span>
                  </div>
                </motion.button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-xs text-[var(--text-secondary)]">OR</span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>

              {/* Demo Access Notice */}
              <p className="text-xs text-[var(--text-secondary)] text-center">
                Don't have an account? Contact the administrator for employee or admin access.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginSelection;
