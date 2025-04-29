
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

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const userProfile = await fetchUserProfile(data.session.user.id);
          setProfile(userProfile);
          setRole(userProfile?.role || null);
          
          if (!userProfile && data.session?.user) {
            console.warn("User authenticated but profile not found. Will retry on next load.");
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

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
            setProfile(userProfile);
            setRole(userProfile?.role || null);
          } catch (profileError) {
            console.error("Error fetching profile after auth state change:", profileError);
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
    };
  }, []);

  return {
    session,
    user,
    profile,
    loading,
    role,
    setSession,
    setUser,
    setProfile,
    setRole,
    setLoading
  };
}
