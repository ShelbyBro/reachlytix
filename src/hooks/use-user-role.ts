
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { role, isAdmin, isClient, isAgent } = useAuth();
  
  return {
    role,
    isAdmin,
    isClient,
    isAgent,
    
    // Helper for role-based UI rendering
    canAccess: (allowedRoles: ("admin" | "client" | "agent")[]) => {
      if (!role) return false;
      return allowedRoles.includes(role);
    }
  };
}
