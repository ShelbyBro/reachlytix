
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function useUserRole() {
  const { role, isAdmin, isClient, isAgent, loading } = useAuth();
  const [roleReady, setRoleReady] = useState(false);
  
  // Mark role as ready once it's loaded or after timeout
  useEffect(() => {
    // Role is ready if it's not null and not loading
    if (role !== null && !loading) {
      setRoleReady(true);
    }
    
    // Fallback timeout in case role loading takes too long
    const timeoutId = setTimeout(() => {
      if (!roleReady) {
        console.warn("Role loading timeout reached in useUserRole");
        setRoleReady(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [role, loading, roleReady]);
  
  return {
    role,
    isAdmin,
    isClient,
    isAgent,
    roleReady,
    
    // Helper for role-based UI rendering
    canAccess: (allowedRoles: ("admin" | "client" | "agent")[]) => {
      if (!role) return false;
      return allowedRoles.includes(role);
    }
  };
}
