
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppRole } from "@/types/auth";

// Check if Supabase is configured - updated to use actual environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
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
