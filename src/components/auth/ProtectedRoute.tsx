import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "team_manager";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAdmin, isTeamManager, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    if (requiredRole === "admin" && !isAdmin) {
      // Redirect to home if admin role is required but user is not an admin
      return <Navigate to="/" replace />;
    }

    if (requiredRole === "team_manager" && !(isAdmin || isTeamManager)) {
      // Redirect to home if team_manager role is required but user is neither admin nor team manager
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
}