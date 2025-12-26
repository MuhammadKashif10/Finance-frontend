import { Navigate } from 'react-router-dom';

// Redirect to login - this page is not used (handled by AppRoutes)
const Index = () => {
  return <Navigate to="/login" replace />;
};

export default Index;
