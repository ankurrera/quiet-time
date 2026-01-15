import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Database } from "@/lib/database.types";

type SessionExerciseRow = Database["public"]["Tables"]["session_exercises"]["Row"];
type SessionSetRow = Database["public"]["Tables"]["session_sets"]["Row"];

export interface SessionSet {
  id?: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  rest_seconds: number | null;
}

export interface SessionExercise {
  id?: string;
  name: string;
  order_index: number;
  sets: SessionSet[];
}

/**
 * Hook to manage exercises and sets for a gym session
 */
export function useSessionExercises(sessionId: string | undefined) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!user || !sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("session_exercises")
        .select("*")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

      if (exercisesError) {
        console.error("Error fetching session exercises:", exercisesError);
        setError(exercisesError.message);
        setIsLoading(false);
        return;
      }

      if (!exercisesData || exercisesData.length === 0) {
        setExercises([]);
        setIsLoading(false);
        return;
      }

      // Fetch sets for all exercises
      const exerciseIds = exercisesData.map(ex => ex.id);
      const { data: setsData, error: setsError } = await supabase
        .from("session_sets")
        .select("*")
        .in("session_exercise_id", exerciseIds)
        .order("set_number", { ascending: true });

      if (setsError) {
        console.error("Error fetching session sets:", setsError);
        setError(setsError.message);
        setIsLoading(false);
        return;
      }

      // Group sets by exercise
      const setsMap: Record<string, SessionSet[]> = {};
      if (setsData) {
        setsData.forEach(set => {
          if (!setsMap[set.session_exercise_id]) {
            setsMap[set.session_exercise_id] = [];
          }
          setsMap[set.session_exercise_id].push({
            id: set.id,
            set_number: set.set_number,
            reps: set.reps,
            weight: set.weight,
            rest_seconds: set.rest_seconds,
          });
        });
      }

      // Combine exercises with their sets
      const sessionExercises: SessionExercise[] = exercisesData.map(ex => ({
        id: ex.id,
        name: ex.name,
        order_index: ex.order_index,
        sets: setsMap[ex.id] || [],
      }));

      setExercises(sessionExercises);
    } catch (err) {
      console.error("Error in fetchExercises:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const addExercise = useCallback(
    async (name: string) => {
      if (!user || !sessionId) return { success: false, error: "No session" };

      try {
        const nextOrderIndex = exercises.length;

        const { data, error: insertError } = await supabase
          .from("session_exercises")
          .insert({
            session_id: sessionId,
            name,
            order_index: nextOrderIndex,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error adding exercise:", insertError);
          return { success: false, error: insertError.message };
        }

        setExercises([
          ...exercises,
          {
            id: data.id,
            name: data.name,
            order_index: data.order_index,
            sets: [],
          },
        ]);

        return { success: true, data };
      } catch (err) {
        console.error("Error in addExercise:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, sessionId, exercises]
  );

  const addSet = useCallback(
    async (exerciseId: string, set: Omit<SessionSet, "id">) => {
      if (!user || !sessionId) return { success: false, error: "No session" };

      try {
        const { data, error: insertError } = await supabase
          .from("session_sets")
          .insert({
            session_exercise_id: exerciseId,
            set_number: set.set_number,
            reps: set.reps,
            weight: set.weight,
            rest_seconds: set.rest_seconds,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error adding set:", insertError);
          return { success: false, error: insertError.message };
        }

        // Update local state
        setExercises(exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: data.id,
                  set_number: data.set_number,
                  reps: data.reps,
                  weight: data.weight,
                  rest_seconds: data.rest_seconds,
                },
              ],
            };
          }
          return ex;
        }));

        return { success: true, data };
      } catch (err) {
        console.error("Error in addSet:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, sessionId, exercises]
  );

  const updateSet = useCallback(
    async (setId: string, updates: Partial<Omit<SessionSet, "id" | "set_number">>) => {
      if (!user || !sessionId) return { success: false, error: "No session" };

      try {
        const { data, error: updateError } = await supabase
          .from("session_sets")
          .update(updates)
          .eq("id", setId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating set:", updateError);
          return { success: false, error: updateError.message };
        }

        // Update local state
        setExercises(exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => 
            s.id === setId
              ? {
                  ...s,
                  reps: data.reps,
                  weight: data.weight,
                  rest_seconds: data.rest_seconds,
                }
              : s
          ),
        })));

        return { success: true };
      } catch (err) {
        console.error("Error in updateSet:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, sessionId, exercises]
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      if (!user || !sessionId) return { success: false, error: "No session" };

      try {
        const { error: deleteError } = await supabase
          .from("session_exercises")
          .delete()
          .eq("id", exerciseId);

        if (deleteError) {
          console.error("Error deleting exercise:", deleteError);
          return { success: false, error: deleteError.message };
        }

        setExercises(exercises.filter(ex => ex.id !== exerciseId));
        return { success: true };
      } catch (err) {
        console.error("Error in deleteExercise:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, sessionId, exercises]
  );

  const copyRoutineExercises = useCallback(
    async (routineExercises: Array<{ name: string; sets: number | null; reps: string | null; rest_seconds: number | null }>) => {
      if (!user || !sessionId) return { success: false, error: "No session" };

      try {
        // Insert all exercises
        const exercisesToInsert = routineExercises.map((ex, index) => ({
          session_id: sessionId,
          name: ex.name,
          order_index: index,
        }));

        const { data: insertedExercises, error: insertError } = await supabase
          .from("session_exercises")
          .insert(exercisesToInsert)
          .select();

        if (insertError) {
          console.error("Error copying exercises:", insertError);
          return { success: false, error: insertError.message };
        }

        // Create empty sets for each exercise
        const setsToInsert: Array<{
          session_exercise_id: string;
          set_number: number;
          reps: number | null;
          weight: number | null;
          rest_seconds: number | null;
        }> = [];

        insertedExercises.forEach((exercise, exerciseIndex) => {
          const routineEx = routineExercises[exerciseIndex];
          const numSets = routineEx.sets || 3; // Default to 3 sets if not specified
          
          for (let i = 1; i <= numSets; i++) {
            setsToInsert.push({
              session_exercise_id: exercise.id,
              set_number: i,
              reps: null,
              weight: null,
              rest_seconds: routineEx.rest_seconds,
            });
          }
        });

        if (setsToInsert.length > 0) {
          const { error: setsError } = await supabase
            .from("session_sets")
            .insert(setsToInsert);

          if (setsError) {
            console.error("Error creating sets:", setsError);
            // Don't fail the whole operation, exercises are already created
          }
        }

        await fetchExercises();
        return { success: true };
      } catch (err) {
        console.error("Error in copyRoutineExercises:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, sessionId, fetchExercises]
  );

  return {
    exercises,
    isLoading,
    error,
    addExercise,
    addSet,
    updateSet,
    deleteExercise,
    copyRoutineExercises,
    refetch: fetchExercises,
  };
}
