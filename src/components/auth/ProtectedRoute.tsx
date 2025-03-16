import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'team_manager';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAdmin, isTeamManager } = useAuth();
  const location = useLocation();

  if (!user) {
    console.log('ProtectedRoute:', { isAdmin, isTeamManager, requiredRole });
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole === 'admin' && !isAdmin) {
    console.log('ProtectedRoute:', { isAdmin, isTeamManager, requiredRole });
    // Redirect to home if admin role is required but user is not admin
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'team_manager' && !(isTeamManager || isAdmin)) {
    console.log('ProtectedRoute:', { isAdmin, isTeamManager, requiredRole });
    // Redirect to home if team manager role is required but user is neither team manager nor admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}