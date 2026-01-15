import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useRoutine } from "@/hooks/useRoutine";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

const AUTOSAVE_DELAY_MS = 1000;

/**
 * Routine Detail Page
 * 
 * Design Philosophy:
 * - Inline editing for all fields
 * - Autosave silently (no success messages)
 * - No modals, no icons
 * - Vertical stack of exercises
 */
export function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { routine, isLoading, updateRoutine, addExercise, updateExercise, deleteExercise } = useRoutine(routineId);

  // Local state for routine fields
  const [editName, setEditName] = useState("");
  const [editFocus, setEditFocus] = useState("");

  // Local state for adding new exercise
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("");
  const [newExerciseReps, setNewExerciseReps] = useState("");
  const [newExerciseRest, setNewExerciseRest] = useState("");

  // Debounced values for autosave
  const debouncedName = useDebounce(editName, AUTOSAVE_DELAY_MS);
  const debouncedFocus = useDebounce(editFocus, AUTOSAVE_DELAY_MS);

  // Initialize edit state when routine loads
  useEffect(() => {
    if (routine) {
      setEditName(routine.name);
      setEditFocus(routine.focus || "");
    }
  }, [routine?.name, routine?.focus]);

  // Autosave routine name and focus
  useEffect(() => {
    if (!routine) return;
    
    const hasChanges =
      debouncedName !== routine.name ||
      debouncedFocus !== (routine.focus || "");

    if (hasChanges && debouncedName.trim()) {
      updateRoutine({
        name: debouncedName.trim(),
        focus: debouncedFocus.trim() || null,
      });
    }
  }, [debouncedName, debouncedFocus, routine, updateRoutine]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;

    const result = await addExercise({
      name: newExerciseName.trim(),
      sets: newExerciseSets ? parseInt(newExerciseSets, 10) : null,
      reps: newExerciseReps.trim() || null,
      rest_seconds: newExerciseRest ? parseInt(newExerciseRest, 10) : null,
    });

    if (result.success) {
      setIsAddingExercise(false);
      setNewExerciseName("");
      setNewExerciseSets("");
      setNewExerciseReps("");
      setNewExerciseRest("");
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!exerciseId) return;
    await deleteExercise(exerciseId);
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    navigate(`/session/${today}`);
  };

  if (isLoading || !routine) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col px-6 py-12 max-w-md mx-auto w-full">
        {/* HEADER - Editable */}
        <header className="text-center mb-10">
          <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-3">
            Routine
          </p>
          
          {/* Editable routine name */}
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full text-center font-serif text-2xl tracking-tight mb-2 bg-transparent border-0 border-b border-transparent text-foreground focus:outline-none focus:border-border transition-calm"
          />
          
          {/* Editable focus */}
          <input
            type="text"
            value={editFocus}
            onChange={(e) => setEditFocus(e.target.value)}
            placeholder="Add focus (e.g., Push / Pull / Legs)"
            className="w-full text-center text-sm font-light text-text-secondary bg-transparent border-0 border-b border-transparent placeholder:text-muted-foreground focus:outline-none focus:border-border transition-calm"
          />
        </header>

        {/* EXERCISES LIST */}
        <div className="flex-1 space-y-8 mb-8">
          {routine.exercises.length === 0 && !isAddingExercise && (
            <div className="text-center py-12">
              <p className="text-sm font-light text-text-secondary mb-6">
                No exercises yet
              </p>
              <button
                onClick={() => setIsAddingExercise(true)}
                className="text-sm font-light underline underline-offset-4 transition-calm hover:text-foreground"
              >
                Add your first exercise
              </button>
            </div>
          )}

          {routine.exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              onUpdate={(updates) => exercise.id && updateExercise(exercise.id, updates)}
              onDelete={() => exercise.id && handleDeleteExercise(exercise.id)}
            />
          ))}

          {/* ADD NEW EXERCISE FORM */}
          {isAddingExercise && (
            <div className="bg-container rounded-3xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    placeholder="Bench Press, Squat..."
                    className="w-full px-0 py-2 text-lg bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={newExerciseSets}
                      onChange={(e) => setNewExerciseSets(e.target.value)}
                      placeholder="4"
                      className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                      Reps
                    </label>
                    <input
                      type="text"
                      value={newExerciseReps}
                      onChange={(e) => setNewExerciseReps(e.target.value)}
                      placeholder="8-10"
                      className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                      Rest (s)
                    </label>
                    <input
                      type="number"
                      value={newExerciseRest}
                      onChange={(e) => setNewExerciseRest(e.target.value)}
                      placeholder="90"
                      className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsAddingExercise(false);
                      setNewExerciseName("");
                      setNewExerciseSets("");
                      setNewExerciseReps("");
                      setNewExerciseRest("");
                    }}
                    className="flex-1 bg-secondary text-foreground py-3 rounded-full text-sm font-normal transition-calm hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExercise}
                    disabled={!newExerciseName.trim()}
                    className="flex-1 bg-foreground text-background py-3 rounded-full text-sm font-normal transition-calm hover:opacity-90 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="space-y-4">
          {!isAddingExercise && (
            <button
              onClick={() => setIsAddingExercise(true)}
              className="w-full py-4 text-sm font-light text-foreground transition-calm hover:text-text-secondary"
            >
              + Add exercise
            </button>
          )}

          <div className="pt-4 border-t border-border/30 space-y-3">
            <button
              onClick={() => navigate("/routines")}
              className="w-full text-sm font-light text-text-secondary transition-calm hover:text-foreground"
            >
              ← Back to routines
            </button>
            <button
              onClick={goToToday}
              className="w-full text-sm font-light text-text-secondary transition-calm hover:text-foreground"
            >
              Return to today's session
            </button>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}

/**
 * Individual exercise item with inline editing
 */
interface ExerciseItemProps {
  exercise: {
    id?: string;
    name: string;
    sets: number | null;
    reps: string | null;
    rest_seconds: number | null;
  };
  onUpdate: (updates: Partial<typeof exercise>) => void;
  onDelete: () => void;
}

function ExerciseItem({ exercise, onUpdate, onDelete }: ExerciseItemProps) {
  const [editName, setEditName] = useState(exercise.name);
  const [editSets, setEditSets] = useState(exercise.sets?.toString() || "");
  const [editReps, setEditReps] = useState(exercise.reps || "");
  const [editRest, setEditRest] = useState(exercise.rest_seconds?.toString() || "");

  const debouncedName = useDebounce(editName, AUTOSAVE_DELAY_MS);
  const debouncedSets = useDebounce(editSets, AUTOSAVE_DELAY_MS);
  const debouncedReps = useDebounce(editReps, AUTOSAVE_DELAY_MS);
  const debouncedRest = useDebounce(editRest, AUTOSAVE_DELAY_MS);

  useEffect(() => {
    const hasChanges =
      debouncedName !== exercise.name ||
      debouncedSets !== (exercise.sets?.toString() || "") ||
      debouncedReps !== (exercise.reps || "") ||
      debouncedRest !== (exercise.rest_seconds?.toString() || "");

    if (hasChanges && debouncedName.trim()) {
      onUpdate({
        name: debouncedName.trim(),
        sets: debouncedSets ? parseInt(debouncedSets, 10) : null,
        reps: debouncedReps.trim() || null,
        rest_seconds: debouncedRest ? parseInt(debouncedRest, 10) : null,
      });
    }
  }, [debouncedName, debouncedSets, debouncedReps, debouncedRest]);

  return (
    <div className="bg-container rounded-3xl p-6">
      <div className="space-y-4">
        {/* Exercise name */}
        <div>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full font-serif text-lg px-0 py-1 bg-transparent border-0 border-b border-transparent text-foreground focus:outline-none focus:border-border transition-calm"
          />
        </div>

        {/* Sets, Reps, Rest */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-1 block">
              Sets
            </label>
            <input
              type="number"
              value={editSets}
              onChange={(e) => setEditSets(e.target.value)}
              placeholder="4"
              className="w-full px-0 py-1 text-sm bg-transparent border-0 border-b border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-calm"
            />
          </div>

          <div>
            <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-1 block">
              Reps
            </label>
            <input
              type="text"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
              placeholder="8-10"
              className="w-full px-0 py-1 text-sm bg-transparent border-0 border-b border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-calm"
            />
          </div>

          <div>
            <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-1 block">
              Rest (s)
            </label>
            <input
              type="number"
              value={editRest}
              onChange={(e) => setEditRest(e.target.value)}
              placeholder="90"
              className="w-full px-0 py-1 text-sm bg-transparent border-0 border-b border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border transition-calm"
            />
          </div>
        </div>

        {/* Delete button */}
        <div className="pt-2">
          <button
            onClick={onDelete}
            className="text-xs font-light text-text-secondary transition-calm hover:text-foreground"
          >
            Remove exercise
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoutineDetail;
