
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ("admin" | "client" | "agent")[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();
  const location = useLocation();
  
  // Show loading state if still determining auth status
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // If role is null or undefined, redirect to login page
  if (!role) {
    console.error("User authenticated but has no role assigned");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(role)) {
      // User doesn't have the required role, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // If authenticated and has required role (or no role required), show children
  return <>{children}</>;
}
