
import React, { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { signInWithEmail, signUpWithEmail, signOutUser } from "@/utils/auth-service";
import { AuthContextType, UserRole } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    session, 
    user, 
    profile, 
    loading, 
    role,
    authError,
    setLoading
  } = useAuthState();

  const signIn = async (email: string, password: string, redirect = false) => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
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
      await signUpWithEmail(email, password, firstName, lastName, role);
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
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
      // We're not throwing here since we want to proceed regardless
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
    authError,
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
