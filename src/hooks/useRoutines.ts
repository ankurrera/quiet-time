import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Database } from "@/lib/database.types";

type RoutineRow = Database["public"]["Tables"]["routines"]["Row"];
type RoutineExerciseRow = Database["public"]["Tables"]["routine_exercises"]["Row"];

export interface RoutineExercise {
  id?: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  order_index: number;
}

export interface Routine {
  id: string;
  name: string;
  focus: string | null;
  exercises: RoutineExercise[];
  created_at: string;
  updated_at: string;
}

export interface RoutineListItem {
  id: string;
  name: string;
  focus: string | null;
  exerciseCount: number;
  usageCount?: number;
}

/**
 * Hook to manage routines list
 */
export function useRoutines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch routines
      const { data: routinesData, error: routinesError } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (routinesError) {
        console.error("Error fetching routines:", routinesError);
        setError(routinesError.message);
        setIsLoading(false);
        return;
      }

      // Fetch exercise counts for each routine
      const routineIds = routinesData.map(r => r.id);
      const { data: exerciseCounts, error: countError } = await supabase
        .from("routine_exercises")
        .select("routine_id")
        .in("routine_id", routineIds);

      if (countError) {
        console.error("Error fetching exercise counts:", countError);
      }

      // Count exercises per routine
      const exerciseCountMap: Record<string, number> = {};
      if (exerciseCounts) {
        exerciseCounts.forEach(ex => {
          exerciseCountMap[ex.routine_id] = (exerciseCountMap[ex.routine_id] || 0) + 1;
        });
      }

      // TODO: Fetch usage counts from gym_sessions
      // For now, we'll set it to 0
      const routineList: RoutineListItem[] = routinesData.map(routine => ({
        id: routine.id,
        name: routine.name,
        focus: routine.focus,
        exerciseCount: exerciseCountMap[routine.id] || 0,
        usageCount: 0,
      }));

      setRoutines(routineList);
    } catch (err) {
      console.error("Error in fetchRoutines:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const createRoutine = useCallback(
    async (name: string, focus?: string) => {
      if (!user) return { success: false, error: "No user" };

      try {
        const { data, error: insertError } = await supabase
          .from("routines")
          .insert({
            user_id: user.id,
            name,
            focus: focus || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating routine:", insertError);
          return { success: false, error: insertError.message };
        }

        await fetchRoutines();
        return { success: true, data };
      } catch (err) {
        console.error("Error in createRoutine:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, fetchRoutines]
  );

  const deleteRoutine = useCallback(
    async (routineId: string) => {
      if (!user) return { success: false, error: "No user" };

      try {
        const { error: deleteError } = await supabase
          .from("routines")
          .delete()
          .eq("id", routineId);

        if (deleteError) {
          console.error("Error deleting routine:", deleteError);
          return { success: false, error: deleteError.message };
        }

        await fetchRoutines();
        return { success: true };
      } catch (err) {
        console.error("Error in deleteRoutine:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, fetchRoutines]
  );

  return {
    routines,
    isLoading,
    error,
    createRoutine,
    deleteRoutine,
    refetch: fetchRoutines,
  };
}
