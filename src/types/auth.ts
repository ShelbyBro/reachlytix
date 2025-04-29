
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "client" | "agent" | "iso";

export type UserProfile = {
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
};

export type AuthContextType = {
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
