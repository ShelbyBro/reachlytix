
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface IsoPortalProps {
  children: ReactNode;
}

export default function IsoPortal({ children }: IsoPortalProps) {
  const { isIso } = useAuth();
  
  if (!isIso()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}
