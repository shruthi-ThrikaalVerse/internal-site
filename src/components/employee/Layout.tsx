import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import { Menu } from 'lucide-react'; // Added Menu import

interface LayoutProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Detect screen size and set initial sidebar state
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, sidebar is closed by default
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        // On desktop, sidebar is open by default
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle sidebar toggle based on device
  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle full sidebar open/close
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      // On desktop, toggle between collapsed and expanded
      setIsCollapsed(!isCollapsed);
    }
  };

  // Close sidebar when route changes on mobile
  const handleRouteChange = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Mobile toggle button - always visible on mobile
  const MobileToggleButton = () => (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      title="Open menu"
    >
      <Menu size={24} />
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile toggle button - only show when sidebar is closed on mobile */}
      {isMobile && !isSidebarOpen && <MobileToggleButton />}

      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}`}>
        <Sidebar 
          isOpen={isMobile ? isSidebarOpen : true}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          onLogout={onLogout}
          onRouteChange={handleRouteChange}
        />
      </div>

      {/* Main Content Area */}
      <div 
        className={`
          flex flex-col flex-1 min-w-0 overflow-hidden
          transition-all duration-300 ease-in-out
          w-full
        `}
      >
        {/* You'll need to create or update the Header component */}
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isCollapsed}
          isMobile={isMobile}
        />
        
        <main 
          className={`
            flex-1 relative overflow-y-auto focus:outline-none
            ${isMobile ? 'p-4 sm:p-6' : 'p-4 md:p-6 lg:p-8'}
            transition-all duration-300
            w-full
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;