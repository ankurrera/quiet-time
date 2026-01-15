import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { YearViewPanel } from "@/components/YearViewPanel";
import { useGymSession } from "@/hooks/useGymSession";
import { useSessionExercises } from "@/hooks/useSessionExercises";
import { useRoutines } from "@/hooks/useRoutines";
import { useRoutine } from "@/hooks/useRoutine";
import { useDebounce } from "@/hooks/useDebounce";
import { getDayOfYear } from "@/lib/dateUtils";
import { format, parse, addDays, subDays } from "date-fns";
import { Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Constants
const AUTOSAVE_DELAY_MS = 1000;
const MIN_SWIPE_DISTANCE_PX = 50;

/**
 * Gym Session Detail Page
 * 
 * Design Philosophy:
 * - A quiet log, a reflection of effort
 * - Routines define structure, sessions define reality
 * - Time is the primary axis
 */
export function GymSessionDetail() {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [showYearView, setShowYearView] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Validate and use date parameter, default to today
  const dateString = dateParam || format(new Date(), "yyyy-MM-dd");
  const { session, isLoading, saveSession } = useGymSession(dateString);
  const { exercises, isLoading: exercisesLoading, updateSet } = useSessionExercises(session?.id);
  const { routines } = useRoutines();
  
  // Parse date for display
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  const dayName = format(date, "EEEE");
  const monthDay = format(date, "MMM d");
  const dayOfYear = getDayOfYear(date);
  const totalDays = date.getFullYear() % 4 === 0 ? 366 : 365;

  // Local state for editing basic fields
  const [editDuration, setEditDuration] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // Debounced values for autosave
  const debouncedDuration = useDebounce(editDuration, AUTOSAVE_DELAY_MS);
  const debouncedNotes = useDebounce(editNotes, AUTOSAVE_DELAY_MS);

  // Initialize edit state when session loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (session) {
      setEditDuration(session.duration_minutes?.toString() || "");
      setEditNotes(session.notes || "");
    }
  }, [session?.id, session?.duration_minutes, session?.notes]);

  // Autosave when debounced values change
  useEffect(() => {
    if (!session || !session.exists) return;

    const hasChanges =
      debouncedDuration !== (session.duration_minutes?.toString() || "") ||
      debouncedNotes !== (session.notes || "");

    if (hasChanges) {
      const updates = {
        duration_minutes: debouncedDuration ? parseInt(debouncedDuration, 10) : null,
        notes: debouncedNotes || null,
      };
      saveSession(updates);
    }
  }, [debouncedDuration, debouncedNotes, session, saveSession]);

  // Navigate to previous day with animation
  const goToPreviousDay = useCallback(() => {
    setSwipeDirection("right");
    const prevDate = subDays(date, 1);
    const prevDateString = format(prevDate, "yyyy-MM-dd");
    setTimeout(() => navigate(`/session/${prevDateString}`), 50);
  }, [date, navigate]);

  // Navigate to next day with animation
  const goToNextDay = useCallback(() => {
    setSwipeDirection("left");
    const nextDate = addDays(date, 1);
    const nextDateString = format(nextDate, "yyyy-MM-dd");
    setTimeout(() => navigate(`/session/${nextDateString}`), 50);
  }, [date, navigate]);

  // Reset swipe state when date changes
  useEffect(() => {
    setSwipeDirection(null);
    setSwipeOffset(0);
  }, [dateString]);

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    
    const diff = currentX - touchStart;
    const clampedOffset = Math.max(-60, Math.min(60, diff * 0.4));
    setSwipeOffset(clampedOffset);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE_PX;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE_PX;

    if (isLeftSwipe) {
      goToNextDay();
    } else if (isRightSwipe) {
      goToPreviousDay();
    } else {
      setSwipeOffset(0);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isLoading || !session) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </AppShell>
    );
  }

  const hasData = session.duration_minutes || session.notes || exercises.length > 0;
  const statusText = hasData ? "Workout logged" : "No session logged";
  
  return (
    <AppShell>
      <YearViewPanel isOpen={showYearView} onClose={() => setShowYearView(false)} />
      <RoutineSelectorSheet
        isOpen={showRoutineSelector}
        onClose={() => setShowRoutineSelector(false)}
        routines={routines}
        sessionId={session.id}
        onRoutineSelected={() => {
          setShowRoutineSelector(false);
        }}
      />
      
      <div 
        className={`flex-1 flex flex-col px-6 py-12 max-w-md mx-auto w-full transition-transform duration-150 ease-out ${
          swipeDirection === "left" ? "animate-slide-in-from-right" : 
          swipeDirection === "right" ? "animate-slide-in-from-left" : 
          "animate-fade-in"
        }`}
        style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* HEADER */}
        <header className="text-center mb-10 relative">
          <button
            onClick={() => setShowYearView(true)}
            className="absolute top-0 right-0 p-2 rounded-full transition-calm hover:bg-muted"
            aria-label="View year"
          >
            <Calendar className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>

          <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-3">
            Session
          </p>
          
          <h1 className="font-serif text-2xl tracking-tight mb-2">
            {dayName}, {monthDay}
          </h1>
          
          <p className="text-sm font-light text-text-secondary">
            Day {dayOfYear} of {totalDays}
          </p>
        </header>
        
        {/* SESSION STATUS */}
        <div className="text-center mb-10">
          <p className="text-sm font-light flex items-center justify-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              session.isToday ? "border-2 border-accent-red" : hasData ? "bg-foreground" : "bg-soft-gray"
            }`} />
            {statusText}
          </p>
        </div>

        {/* ROUTINE SELECTION PROMPT */}
        {exercises.length === 0 && (
          <div className="mb-8 text-center">
            <p className="text-sm font-light text-text-secondary mb-4">
              Select a routine for today
            </p>
            <button
              onClick={() => setShowRoutineSelector(true)}
              className="text-sm font-light underline underline-offset-4 transition-calm hover:text-foreground"
            >
              Choose routine
            </button>
            <p className="text-xs font-light text-text-secondary mt-4">
              or{" "}
              <button
                onClick={() => navigate("/routines")}
                className="underline underline-offset-4 transition-calm hover:text-foreground"
              >
                create a new one
              </button>
            </p>
          </div>
        )}
        
        {/* EXERCISES */}
        {exercises.length > 0 && (
          <div className="space-y-6 mb-8">
            {exercises.map((exercise) => (
              <ExerciseLog
                key={exercise.id}
                exercise={exercise}
                onSetUpdate={(setId, updates) => updateSet(setId, updates)}
              />
            ))}
          </div>
        )}

        {/* TIME & NOTES */}
        <div className="bg-container rounded-3xl p-8 mb-10">
          {/* Duration */}
          <div className="mb-6">
            <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              placeholder="60"
              className="w-full px-0 py-2 text-2xl bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="How did you feel?"
              rows={3}
              className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm resize-none"
            />
          </div>
        </div>
        
        {/* FOOTER */}
        <footer className="text-center mt-auto pt-8">
          <p className="text-sm font-light text-text-secondary">
            {hasData ? "You showed up today." : "Every day is an opportunity."}
          </p>
        </footer>
      </div>
    </AppShell>
  );
}

/**
 * Exercise Log Component
 * Shows exercise name and individual sets with inline editing
 */
interface ExerciseLogProps {
  exercise: {
    id?: string;
    name: string;
    sets: Array<{
      id?: string;
      set_number: number;
      reps: number | null;
      weight: number | null;
      rest_seconds: number | null;
    }>;
  };
  onSetUpdate: (setId: string, updates: { reps?: number | null; weight?: number | null }) => void;
}

function ExerciseLog({ exercise, onSetUpdate }: ExerciseLogProps) {
  return (
    <div className="bg-container rounded-3xl p-6">
      <h3 className="font-serif text-lg mb-4">{exercise.name}</h3>
      
      <div className="space-y-3">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id || set.set_number}
            set={set}
            onUpdate={(updates) => set.id && onSetUpdate(set.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Set Row
 * Allows inline editing of reps and weight
 */
interface SetRowProps {
  set: {
    id?: string;
    set_number: number;
    reps: number | null;
    weight: number | null;
    rest_seconds: number | null;
  };
  onUpdate: (updates: { reps?: number | null; weight?: number | null }) => void;
}

function SetRow({ set, onUpdate }: SetRowProps) {
  const [editReps, setEditReps] = useState(set.reps?.toString() || "");
  const [editWeight, setEditWeight] = useState(set.weight?.toString() || "");

  const debouncedReps = useDebounce(editReps, AUTOSAVE_DELAY_MS);
  const debouncedWeight = useDebounce(editWeight, AUTOSAVE_DELAY_MS);

  useEffect(() => {
    const hasChanges =
      debouncedReps !== (set.reps?.toString() || "") ||
      debouncedWeight !== (set.weight?.toString() || "");

    if (hasChanges) {
      onUpdate({
        reps: debouncedReps ? parseInt(debouncedReps, 10) : null,
        weight: debouncedWeight ? parseFloat(debouncedWeight) : null,
      });
    }
  }, [debouncedReps, debouncedWeight, set.reps, set.weight, onUpdate]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-secondary w-12">Set {set.set_number}</span>
      
      <input
        type="number"
        value={editReps}
        onChange={(e) => setEditReps(e.target.value)}
        placeholder="8"
        className="w-16 px-2 py-1 text-center bg-transparent border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
      />
      <span className="text-text-secondary">reps</span>
      
      <input
        type="number"
        step="0.5"
        value={editWeight}
        onChange={(e) => setEditWeight(e.target.value)}
        placeholder="60"
        className="w-16 px-2 py-1 text-center bg-transparent border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
      />
      <span className="text-text-secondary">kg</span>
    </div>
  );
}

/**
 * Routine Selector Sheet
 * Bottom sheet for selecting a routine for the session
 */
interface RoutineSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routines: Array<{
    id: string;
    name: string;
    focus: string | null;
    exerciseCount: number;
  }>;
  sessionId?: string;
  onRoutineSelected: () => void;
}

function RoutineSelectorSheet({
  isOpen,
  onClose,
  routines,
  sessionId,
  onRoutineSelected,
}: RoutineSelectorSheetProps) {
  const { routine: selectedRoutine, isLoading: routineLoading } = useRoutine(undefined);
  const { copyRoutineExercises } = useSessionExercises(sessionId);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const { routine: routineToLoad } = useRoutine(selectedRoutineId || undefined);

  const handleSelectRoutine = async (routineId: string) => {
    setSelectedRoutineId(routineId);
  };

  useEffect(() => {
    if (routineToLoad && sessionId) {
      // Copy exercises from routine to session
      copyRoutineExercises(
        routineToLoad.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
        }))
      ).then(() => {
        onRoutineSelected();
        setSelectedRoutineId(null);
      });
    }
  }, [routineToLoad, sessionId, copyRoutineExercises, onRoutineSelected]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl text-center mb-6">
            Select a Routine
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {routines.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm font-light text-text-secondary">
                No routines yet. Create one to get started.
              </p>
            </div>
          )}

          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => handleSelectRoutine(routine.id)}
              disabled={selectedRoutineId === routine.id}
              className="w-full text-left bg-container rounded-2xl p-5 transition-calm hover:bg-container/80 disabled:opacity-50"
            >
              <h3 className="font-serif text-lg mb-1">{routine.name}</h3>
              {routine.focus && (
                <p className="text-sm font-light text-text-secondary mb-2">
                  {routine.focus}
                </p>
              )}
              <p className="text-xs font-light text-text-secondary">
                {routine.exerciseCount} {routine.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default GymSessionDetail;
