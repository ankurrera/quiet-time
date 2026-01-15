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
          routine_id: string | null;
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
          routine_id?: string | null;
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
          routine_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          focus: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          focus?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          focus?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      routine_exercises: {
        Row: {
          id: string;
          routine_id: string;
          name: string;
          sets: number | null;
          reps: string | null;
          rest_seconds: number | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          routine_id: string;
          name: string;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          routine_id?: string;
          name?: string;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          order_index?: number;
          created_at?: string;
        };
      };
      session_exercises: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      session_sets: {
        Row: {
          id: string;
          session_exercise_id: string;
          set_number: number;
          reps: number | null;
          weight: number | null;
          rest_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_exercise_id: string;
          set_number: number;
          reps?: number | null;
          weight?: number | null;
          rest_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_exercise_id?: string;
          set_number?: number;
          reps?: number | null;
          weight?: number | null;
          rest_seconds?: number | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
