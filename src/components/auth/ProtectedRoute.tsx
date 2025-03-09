
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppRole } from "@/types/auth";

// Hardcoded values for Supabase configuration
const supabaseUrl = 'https://lqdvtghdufzwrtuszuhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHZ0Z2hkdWZ6d3J0dXN6dWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTQ2MDYsImV4cCI6MjA1NzEzMDYwNn0.BBPiOdTjXE2ArG6yttLkcmeK9VVirdyD0NTi7HxcDVQ';
const isMissingCredentials = !supabaseUrl || !supabaseAnonKey;

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  // Skip authentication if Supabase isn't configured (development mode)
  if (isMissingCredentials) {
    console.warn('Supabase credentials are missing. Authentication is bypassed.');
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required, check for it
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
