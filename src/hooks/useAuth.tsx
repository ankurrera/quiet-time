import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { 
  AuthContextType, 
  AuthState, 
  Profile, 
  CreateProfileInput, 
  AuthResult 
} from "@/lib/authTypes";
import { 
  validatePassword, 
  validateEmail, 
  getAuthErrorMessage 
} from "@/lib/authTypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isInitialized: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If no profile exists, that's expected for new users
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  }, []);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          updateState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          updateState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          updateState({
            isLoading: false,
            isInitialized: true,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id);
          updateState({
            user: session.user,
            session,
            profile,
            isLoading: false,
          });
        } else if (event === "SIGNED_OUT") {
          updateState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          });
        } else if (event === "TOKEN_REFRESHED" && session) {
          updateState({ session });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, updateState]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    updateState({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      updateState({ isLoading: false });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true };
  }, [updateState]);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    updateState({ isLoading: true });

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      updateState({ isLoading: false });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true };
  }, [updateState]);

  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    updateState({ isLoading: true });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    updateState({ isLoading: false });

    if (error) {
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true };
  }, [updateState]);

  const signOut = useCallback(async (): Promise<void> => {
    updateState({ isLoading: true });
    await supabase.auth.signOut();
    updateState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
    });
  }, [updateState]);

  const createProfile = useCallback(async (profileInput: CreateProfileInput): Promise<AuthResult> => {
    if (!state.user) {
      return { success: false, error: "You must be signed in to create a profile." };
    }

    if (!profileInput.preferred_name?.trim()) {
      return { success: false, error: "Please enter a preferred name." };
    }

    updateState({ isLoading: true });

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: state.user.id,
        full_name: profileInput.full_name?.trim() || null,
        preferred_name: profileInput.preferred_name.trim(),
        gym_start_date: profileInput.gym_start_date || null,
        weekly_goal: profileInput.weekly_goal || null,
      })
      .select()
      .single();

    if (error) {
      updateState({ isLoading: false });
      
      // Handle duplicate profile error
      if (error.code === "23505") {
        return { success: false, error: "Profile already exists." };
      }
      
      return { success: false, error: "Could not create profile. Please try again." };
    }

    updateState({ profile: data, isLoading: false });
    return { success: true };
  }, [state.user, updateState]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      updateState({ profile });
    }
  }, [state.user, fetchProfile, updateState]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    createProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
