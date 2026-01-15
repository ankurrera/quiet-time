import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { parse, format, isToday as isTodayFn } from "date-fns";
import type { Database } from "@/lib/database.types";

type GymSessionRow = Database["public"]["Tables"]["gym_sessions"]["Row"];
type GymSessionInsert = Database["public"]["Tables"]["gym_sessions"]["Insert"];
type GymSessionUpdate = Database["public"]["Tables"]["gym_sessions"]["Update"];

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  note?: string;
}

export interface GymSessionData {
  id?: string;
  date: string; // YYYY-MM-DD format
  duration_minutes?: number | null;
  workout_type?: string | null;
  exercises: Exercise[];
  notes?: string | null;
  exists: boolean;
  isToday: boolean;
}

export interface UpdateSessionData {
  duration_minutes?: number | null;
  workout_type?: string | null;
  exercises?: Exercise[];
  notes?: string | null;
}

/**
 * Hook to manage gym session data for a specific date
 * Automatically fetches, creates, and updates sessions
 */
export function useGymSession(dateString: string) {
  const { user } = useAuth();
  const [session, setSession] = useState<GymSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse date and check if it's today
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  const isToday = isTodayFn(date);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("gym_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_date", dateString)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching session:", fetchError);
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        // Session exists
        setSession({
          id: data.id,
          date: data.session_date,
          duration_minutes: data.duration_minutes,
          workout_type: data.workout_type,
          exercises: (data.exercises as Exercise[]) || [],
          notes: data.notes,
          exists: true,
          isToday,
        });
      } else {
        // Session doesn't exist - set empty session
        setSession({
          date: dateString,
          duration_minutes: null,
          workout_type: null,
          exercises: [],
          notes: null,
          exists: false,
          isToday,
        });
      }
    } catch (err) {
      console.error("Error in fetchSession:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user, dateString, isToday]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Create or update session
  const saveSession = useCallback(
    async (updates: UpdateSessionData) => {
      if (!user || !session) return { success: false, error: "No user or session" };

      try {
        if (session.exists && session.id) {
          // Update existing session
          const updateData: GymSessionUpdate = {
            duration_minutes: updates.duration_minutes !== undefined ? updates.duration_minutes : session.duration_minutes,
            workout_type: updates.workout_type !== undefined ? updates.workout_type : session.workout_type,
            exercises: updates.exercises !== undefined ? updates.exercises : session.exercises,
            notes: updates.notes !== undefined ? updates.notes : session.notes,
          };

          const { data, error: updateError } = await supabase
            .from("gym_sessions")
            .update(updateData)
            .eq("id", session.id)
            .select()
            .single();

          if (updateError) {
            console.error("Error updating session:", updateError);
            return { success: false, error: updateError.message };
          }

          // Update local state
          setSession({
            id: data.id,
            date: data.session_date,
            duration_minutes: data.duration_minutes,
            workout_type: data.workout_type,
            exercises: (data.exercises as Exercise[]) || [],
            notes: data.notes,
            exists: true,
            isToday,
          });

          return { success: true };
        } else {
          // Create new session
          const insertData: GymSessionInsert = {
            user_id: user.id,
            session_date: dateString,
            duration_minutes: updates.duration_minutes || null,
            workout_type: updates.workout_type || null,
            exercises: updates.exercises || [],
            notes: updates.notes || null,
          };

          const { data, error: insertError } = await supabase
            .from("gym_sessions")
            .insert(insertData)
            .select()
            .single();

          if (insertError) {
            console.error("Error creating session:", insertError);
            return { success: false, error: insertError.message };
          }

          // Update local state
          setSession({
            id: data.id,
            date: data.session_date,
            duration_minutes: data.duration_minutes,
            workout_type: data.workout_type,
            exercises: (data.exercises as Exercise[]) || [],
            notes: data.notes,
            exists: true,
            isToday,
          });

          return { success: true };
        }
      } catch (err) {
        console.error("Error in saveSession:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, session, dateString, isToday]
  );

  return {
    session,
    isLoading,
    error,
    saveSession,
    refetch: fetchSession,
  };
}
