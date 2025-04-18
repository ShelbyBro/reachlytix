
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type UserRole = "admin" | "client" | "agent";

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isClient: () => boolean;
  isAgent: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

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
    // Set initial session and user
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
          
          // If profile fetch failed but we have a user, handle gracefully
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // First update the basic auth state immediately without waiting for profile fetch
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // If user signed out, clear profile and role
      if (!currentSession?.user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      // Then fetch profile information if signed in
      if (currentSession?.user) {
        // Use setTimeout to prevent potential deadlock with Supabase client
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
        navigate('/dashboard');
      }
      
      if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully");
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        throw error;
      }
      // Auth state change listener will handle navigation
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
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

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      // Auth state change listener will handle navigation
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Role check helper functions
  const isAdmin = () => role === "admin";
  const isClient = () => role === "client";
  const isAgent = () => role === "agent";

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
    isAgent
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
