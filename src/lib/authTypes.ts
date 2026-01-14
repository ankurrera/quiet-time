import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  preferred_name: string;
  gym_start_date: string | null;
  weekly_goal: number | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  createProfile: (profile: CreateProfileInput) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

export interface CreateProfileInput {
  full_name?: string | null;
  preferred_name: string;
  gym_start_date?: string | null;
  weekly_goal?: number | null;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

// Validation
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password needs at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  return { isValid: true };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
    };
  }
  return { isValid: true };
}

// Map Supabase error messages to human-friendly messages
export function getAuthErrorMessage(error: string): string {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes("invalid login credentials") || 
      errorLower.includes("invalid credentials")) {
    return "That email or password doesn't look right.";
  }
  
  if (errorLower.includes("email not confirmed")) {
    return "Please check your email and confirm your account first.";
  }
  
  if (errorLower.includes("user already registered") || 
      errorLower.includes("already exists") ||
      errorLower.includes("already been registered")) {
    return "This email is already in use.";
  }
  
  if (errorLower.includes("email rate limit exceeded") ||
      errorLower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  
  if (errorLower.includes("network") || 
      errorLower.includes("fetch")) {
    return "Connection issue. Please check your internet and try again.";
  }
  
  if (errorLower.includes("password")) {
    return "Password needs at least 8 characters.";
  }

  if (errorLower.includes("email")) {
    return "Please enter a valid email address.";
  }
  
  // Fallback for unknown errors
  return "Something went wrong. Please try again.";
}
