
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { UserProfile, UserRole } from "@/types/auth";
import { fetchUserProfile } from "@/utils/auth-service";
import { toast } from "sonner";

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const userProfile = await fetchUserProfile(data.session.user.id);
          
          if (!userProfile && data.session?.user) {
            console.warn("User authenticated but profile not found. Will retry on next load.");
            setAuthError("Profile not found. Please log out and try again.");
            
            // Set a default role to prevent hanging UI
            setRole('client');
          } else if (userProfile) {
            setProfile(userProfile);
            
            // Map database role to application role
            let appRole: UserRole = userProfile.role;
            // If role is "agent" but user metadata indicates they should be "iso"
            if (userProfile.role === "agent" && 
                data.session.user.user_metadata?.role === "iso") {
              appRole = "iso";
            }
            
            setRole(appRole);
            setAuthError(null);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthError("Error loading your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Add a timeout to prevent infinite loading
    const maxLoadingTime = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timed out after 8 seconds");
        setLoading(false);
        setAuthError("Authentication timed out. Please refresh the page.");
      }
    }, 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (!currentSession?.user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      if (currentSession?.user) {
        setTimeout(async () => {
          try {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            
            if (!userProfile) {
              console.warn("onAuthStateChange: User authenticated but profile not found");
              setAuthError("Profile not found. Please log out and try again.");
              // Set a default role to prevent hanging UI
              setRole('client');
            } else {
              setProfile(userProfile);
              
              // Map database role to application role
              let appRole: UserRole = userProfile.role;
              // If role is "agent" but user metadata indicates they should be "iso"
              if (userProfile.role === "agent" && 
                  currentSession.user.user_metadata?.role === "iso") {
                appRole = "iso";
              }
              
              setRole(appRole);
              setAuthError(null);
            }
          } catch (profileError) {
            console.error("Error fetching profile after auth state change:", profileError);
            setAuthError("Error loading your profile. Please try again.");
          } finally {
            setLoading(false);
          }
        }, 0);
      }

      if (event === 'SIGNED_IN') {
        toast.success("Successfully signed in!");
      }
      
      if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(maxLoadingTime);
    };
  }, []);

  return {
    session,
    user,
    profile,
    loading,
    role,
    authError,
    setSession,
    setUser,
    setProfile,
    setRole,
    setLoading,
    setAuthError
  };
}
