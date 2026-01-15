import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Database } from "@/lib/database.types";
import type { Routine, RoutineExercise } from "./useRoutines";

/**
 * Hook to manage a single routine
 */
export function useRoutine(routineId: string | undefined) {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutine = useCallback(async () => {
    if (!user || !routineId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch routine
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .select("*")
        .eq("id", routineId)
        .eq("user_id", user.id)
        .single();

      if (routineError) {
        console.error("Error fetching routine:", routineError);
        setError(routineError.message);
        setIsLoading(false);
        return;
      }

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("routine_exercises")
        .select("*")
        .eq("routine_id", routineId)
        .order("order_index", { ascending: true });

      if (exercisesError) {
        console.error("Error fetching exercises:", exercisesError);
        setError(exercisesError.message);
        setIsLoading(false);
        return;
      }

      const exercises: RoutineExercise[] = exercisesData.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        order_index: ex.order_index,
      }));

      setRoutine({
        id: routineData.id,
        name: routineData.name,
        focus: routineData.focus,
        exercises,
        created_at: routineData.created_at,
        updated_at: routineData.updated_at,
      });
    } catch (err) {
      console.error("Error in fetchRoutine:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user, routineId]);

  useEffect(() => {
    fetchRoutine();
  }, [fetchRoutine]);

  const updateRoutine = useCallback(
    async (updates: { name?: string; focus?: string | null }) => {
      if (!user || !routineId || !routine) return { success: false, error: "No routine" };

      try {
        const { data, error: updateError } = await supabase
          .from("routines")
          .update(updates)
          .eq("id", routineId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating routine:", updateError);
          return { success: false, error: updateError.message };
        }

        setRoutine({
          ...routine,
          name: data.name,
          focus: data.focus,
          updated_at: data.updated_at,
        });

        return { success: true };
      } catch (err) {
        console.error("Error in updateRoutine:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, routineId, routine]
  );

  const addExercise = useCallback(
    async (exercise: Omit<RoutineExercise, "id" | "order_index">) => {
      if (!user || !routineId || !routine) return { success: false, error: "No routine" };

      try {
        const nextOrderIndex = routine.exercises.length;

        const { data, error: insertError } = await supabase
          .from("routine_exercises")
          .insert({
            routine_id: routineId,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.rest_seconds,
            order_index: nextOrderIndex,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error adding exercise:", insertError);
          return { success: false, error: insertError.message };
        }

        setRoutine({
          ...routine,
          exercises: [
            ...routine.exercises,
            {
              id: data.id,
              name: data.name,
              sets: data.sets,
              reps: data.reps,
              rest_seconds: data.rest_seconds,
              order_index: data.order_index,
            },
          ],
        });

        return { success: true, data };
      } catch (err) {
        console.error("Error in addExercise:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, routineId, routine]
  );

  const updateExercise = useCallback(
    async (exerciseId: string, updates: Partial<RoutineExercise>) => {
      if (!user || !routineId || !routine) return { success: false, error: "No routine" };

      try {
        const { data, error: updateError } = await supabase
          .from("routine_exercises")
          .update({
            name: updates.name,
            sets: updates.sets,
            reps: updates.reps,
            rest_seconds: updates.rest_seconds,
          })
          .eq("id", exerciseId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating exercise:", updateError);
          return { success: false, error: updateError.message };
        }

        setRoutine({
          ...routine,
          exercises: routine.exercises.map(ex =>
            ex.id === exerciseId
              ? {
                  id: data.id,
                  name: data.name,
                  sets: data.sets,
                  reps: data.reps,
                  rest_seconds: data.rest_seconds,
                  order_index: data.order_index,
                }
              : ex
          ),
        });

        return { success: true };
      } catch (err) {
        console.error("Error in updateExercise:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, routineId, routine]
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      if (!user || !routineId || !routine) return { success: false, error: "No routine" };

      try {
        const { error: deleteError } = await supabase
          .from("routine_exercises")
          .delete()
          .eq("id", exerciseId);

        if (deleteError) {
          console.error("Error deleting exercise:", deleteError);
          return { success: false, error: deleteError.message };
        }

        setRoutine({
          ...routine,
          exercises: routine.exercises.filter(ex => ex.id !== exerciseId),
        });

        return { success: true };
      } catch (err) {
        console.error("Error in deleteExercise:", err);
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    [user, routineId, routine]
  );

  return {
    routine,
    isLoading,
    error,
    updateRoutine,
    addExercise,
    updateExercise,
    deleteExercise,
    refetch: fetchRoutine,
  };
}
