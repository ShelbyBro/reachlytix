
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface IsoPortalProps {
  children: ReactNode;
}

export default function IsoPortal({ children }: IsoPortalProps) {
  const { user, role, isIso } = useAuth();
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If user exists but is not ISO, redirect to appropriate dashboard
  if (!isIso()) {
    if (role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // User is ISO, show ISO content
  return <>{children}</>;
}
