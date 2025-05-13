
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/use-user-role";
import { UserRole } from "@/types/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, authError } = useAuth();
  const { role, roleReady } = useUserRole();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Show auth error message if present
  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);
  
  // Add timeout for handling very slow auth responses
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading || !roleReady) {
        console.warn("Auth loading timeout reached after 5 seconds");
        setTimeoutReached(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [loading, roleReady]);
  
  // Show loading state if still determining auth status and timeout not reached
  if ((loading || !roleReady) && !timeoutReached) {
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
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If timeout reached but user exists, assume minimal access
  if (timeoutReached && user && !role) {
    console.warn("Auth timeout reached but user authenticated - assuming minimal access");
    // Display warning to user
    toast.warning("Could not fully verify your access level. Some features might be limited.");
    
    // If specific roles required, redirect to dashboard for safety
    if (requiredRoles && requiredRoles.length > 0) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Otherwise, allow access to the requested page
    return <>{children}</>;
  }
  
  // If role is null or undefined but the timeout hasn't been reached,
  // redirect to login page with a specific message
  if (!role && !timeoutReached) {
    toast.error("Your user profile is incomplete. Please contact support.");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0 && role) {
    if (!requiredRoles.includes(role)) {
      console.log(`User has role ${role} but needs one of ${requiredRoles.join(", ")}`);
      
      // User doesn't have the required role, redirect to appropriate dashboard based on role
      if (role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
      } else if (role === "iso") {
        return <Navigate to="/iso-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  
  // If authenticated and has required role (or no role required), show children
  return <>{children}</>;
}
