import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminRole } from '@/services/auth.service';

interface RoleProtectedRouteProps {
  allowedRoles: AdminRole[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-dark text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
