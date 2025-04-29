
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// Define a type that includes all possible user roles
type UserRole = "admin" | "client" | "agent" | "iso";

export function useUserRole() {
  const { role, isAdmin, isClient, isAgent, isIso, loading } = useAuth();
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
    isIso,
    roleReady,
    
    // Helper for role-based UI rendering
    // Update the type to include all possible roles from the auth context
    canAccess: (allowedRoles: UserRole[]) => {
      if (!role) return false;
      return allowedRoles.includes(role as UserRole);
    }
  };
}
