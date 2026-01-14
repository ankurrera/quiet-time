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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
