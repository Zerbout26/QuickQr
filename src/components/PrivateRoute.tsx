
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-qr-primary mb-4" />
        <p className="text-gray-600 font-medium">Loading your session...</p>
      </div>
    );
  }

  if (!user) {
    // Save the current location the user was trying to navigate to
    return <Navigate to="/signin" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
