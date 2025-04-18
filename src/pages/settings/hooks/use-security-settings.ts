
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link."
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send password reset email."
      });
    }
  };

  return { sendPasswordReset };
}
