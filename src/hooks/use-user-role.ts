
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

export function useUserRole() {
  const { role, isAdmin, isClient, isAgent, isIso, loading, authError } = useAuth();
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    if (role !== null && !loading) {
      setRoleReady(true);
    }
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
    authError,

    canAccess: (allowedRoles: UserRole[]) => {
      if (!role) return false;
      return allowedRoles.includes(role as UserRole);
    }
  };
}
