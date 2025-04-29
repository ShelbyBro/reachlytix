import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type UserRole = "admin" | "client" | "agent" | "iso";

type UserProfile = {
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string, redirect?: boolean) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isClient: () => boolean;
  isAgent: () => boolean;
  isIso: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    }
  };

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

  const signIn = async (email: string, password: string, redirect = false) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        throw error;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = "client") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        }
      });
      if (error) {
        toast.error(error.message);
        throw error;
      }
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => role === "admin";
  const isClient = () => role === "client";
  const isAgent = () => role === "agent";
  const isIso = () => role === "iso";

  const value = {
    session,
    user,
    profile,
    loading,
    role,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isClient,
    isAgent,
    isIso
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
