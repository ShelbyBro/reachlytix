
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useUserManagement() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users."
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "client" | "agent") => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}.`
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role."
      });
    }
  };

  return {
    users,
    loadingUsers,
    updateUserRole
  };
}
