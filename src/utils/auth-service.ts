
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile, UserRole } from "@/types/auth";

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log(`Fetching profile for user ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, role, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      
      // Check if this is a "not found" error, which might indicate the profile wasn't created
      if (error.code === 'PGRST116') {
        console.warn(`Profile not found for user ${userId}. This could indicate a failed trigger.`);
        
        // Attempt to create profile as a fallback
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            role: 'client' as UserRole,
          });
        
        if (insertError) {
          console.error("Failed to create missing profile:", insertError);
        } else {
          console.log("Created missing profile as fallback");
          // Return minimal profile
          return {
            first_name: '',
            last_name: '',
            role: 'client',
          };
        }
      }
      
      return null;
    }
    
    console.log("Profile fetched successfully:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Exception fetching user profile:", error);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    toast.error(error.message);
    throw error;
  }
  return { success: true };
}

export async function signUpWithEmail(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  role: UserRole = "client"
) {
  console.log("Signing up with user metadata:", { firstName, lastName, role });
  
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
  return { success: true };
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error && error.name !== "AuthSessionMissingError") {
      toast.error(error.message);
      throw error;
    }
    return { success: true };
  } catch (signOutError: any) {
    // If it's just an AuthSessionMissingError, we can proceed normally
    if (signOutError.name !== "AuthSessionMissingError") {
      console.error("Unexpected sign out error:", signOutError);
      toast.error("Error signing out. Please try again.");
      throw signOutError;
    }
    return { success: true };
  }
}
