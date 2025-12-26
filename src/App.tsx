import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AppRoutes from "@/routes/AppRoutes";
import { isAuthenticated } from "@/lib/auth";

const queryClient = new QueryClient();

/**
 * Conditional Layout Wrapper
 * Only wraps dashboard routes with DashboardLayout
 * Login page should never have the sidebar
 */
const LayoutWrapper = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const authenticated = isAuthenticated();

  // Show login page without any layout (no sidebar)
  if (isLoginPage) {
    return <AppRoutes />;
  }

  // Show dashboard routes with layout only if authenticated
  if (authenticated) {
    return (
      <DashboardLayout>
        <AppRoutes />
      </DashboardLayout>
    );
  }

  // Not authenticated and not on login page - show routes (will redirect to login)
  return <AppRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
