export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          preferred_name: string;
          gym_start_date: string | null;
          weekly_goal: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          preferred_name: string;
          gym_start_date?: string | null;
          weekly_goal?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          preferred_name?: string;
          gym_start_date?: string | null;
          weekly_goal?: number | null;
          created_at?: string;
        };
      };
      gym_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          duration_minutes: number | null;
          workout_type: string | null;
          exercises: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_date: string;
          duration_minutes?: number | null;
          workout_type?: string | null;
          exercises?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_date?: string;
          duration_minutes?: number | null;
          workout_type?: string | null;
          exercises?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
