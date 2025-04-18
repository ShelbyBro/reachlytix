
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ("admin" | "client" | "agent")[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Add timeout for handling very slow auth responses
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout reached after 5 seconds");
        setTimeoutReached(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);
  
  // Show loading state if still determining auth status and timeout not reached
  if (loading && !timeoutReached) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // If loading took too long or not authenticated, redirect to login page
  if (timeoutReached || !user) {
    console.log("Redirecting to login due to:", timeoutReached ? "timeout" : "no user");
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
