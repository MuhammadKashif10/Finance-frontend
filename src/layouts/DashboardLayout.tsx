import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Main dashboard layout with sidebar and content area
 * Handles responsive layout for mobile and desktop
 * Only shows sidebar when authenticated and not on login page
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const authenticated = isAuthenticated();

  // Don't show layout on login page
  if (isLoginPage || !authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
