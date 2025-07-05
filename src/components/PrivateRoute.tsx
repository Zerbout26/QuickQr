import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Loading your session..." />;
  }

  if (!user) {
    // Save the current location the user was trying to navigate to
    return <Navigate to="/signin" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
