import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationToast from './NotificationToast';
import ErrorBoundary from './ErrorBoundary';

const LayoutWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header setOpen={setSidebarOpen} />
        <main className="flex-1 w-full overflow-y-auto p-4 lg:p-8 bg-[#f8fafc]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <NotificationToast />
    </div>
  );
};

export default LayoutWrapper;
