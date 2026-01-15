import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { YearViewPanel } from "@/components/YearViewPanel";
import { useGymSession } from "@/hooks/useGymSession";
import { useDebounce } from "@/hooks/useDebounce";
import { getDayOfYear } from "@/lib/dateUtils";
import { format, parse, addDays, subDays } from "date-fns";
import { Calendar } from "lucide-react";

// Constants
const AUTOSAVE_DELAY_MS = 1000;
const MIN_SWIPE_DISTANCE_PX = 50;

/**
 * Gym Session Detail Page
 * 
 * Design Philosophy:
 * - A quiet log, a reflection of effort
 * - Not a fitness dashboard
 * - Not motivational or performance-driven
 * - Answers: "What did I do on this day?"
 */
export function GymSessionDetail() {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showYearView, setShowYearView] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Validate and use date parameter, default to today
  const dateString = dateParam || format(new Date(), "yyyy-MM-dd");
  const { session, isLoading, saveSession } = useGymSession(dateString);
  
  // Parse date for display
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  const dayName = format(date, "EEEE");
  const monthDay = format(date, "MMM d");
  const dayOfYear = getDayOfYear(date);
  const totalDays = date.getFullYear() % 4 === 0 ? 366 : 365;

  // Local state for editing
  const [editDuration, setEditDuration] = useState<string>("");
  const [editWorkoutType, setEditWorkoutType] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // Debounced values for autosave
  const debouncedDuration = useDebounce(editDuration, AUTOSAVE_DELAY_MS);
  const debouncedWorkoutType = useDebounce(editWorkoutType, AUTOSAVE_DELAY_MS);
  const debouncedNotes = useDebounce(editNotes, AUTOSAVE_DELAY_MS);

  // When entering edit mode, populate local state
  const handleStartEdit = () => {
    if (session) {
      setEditDuration(session.duration_minutes?.toString() || "");
      setEditWorkoutType(session.workout_type || "");
      setEditNotes(session.notes || "");
      setIsEditing(true);
    }
  };

  // Autosave when debounced values change
  useEffect(() => {
    if (!isEditing || !session) return;

    // Only save if values have changed from original
    const hasChanges =
      debouncedDuration !== (session.duration_minutes?.toString() || "") ||
      debouncedWorkoutType !== (session.workout_type || "") ||
      debouncedNotes !== (session.notes || "");

    if (hasChanges) {
      const updates = {
        duration_minutes: debouncedDuration ? parseInt(debouncedDuration, 10) : null,
        workout_type: debouncedWorkoutType || null,
        notes: debouncedNotes || null,
      };
      saveSession(updates);
    }
  }, [debouncedDuration, debouncedWorkoutType, debouncedNotes, isEditing, session, saveSession]);

  // Done editing
  const handleDoneEdit = () => {
    setIsEditing(false);
  };

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
    if (isEditing) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isEditing || !touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    
    // Calculate offset for visual feedback (clamped)
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
      // Reset offset if no navigation
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

  // Determine status
  const hasData = session.duration_minutes || session.workout_type || session.notes || session.exercises.length > 0;
  const statusText = hasData ? "Workout logged" : "No session logged";
  
  return (
    <AppShell>
      <YearViewPanel isOpen={showYearView} onClose={() => setShowYearView(false)} />
      
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
        {/* HEADER - Very Subtle, Centered */}
        <header className="text-center mb-10 relative">
          {/* Calendar button - top right */}
          <button
            onClick={() => setShowYearView(true)}
            className="absolute top-0 right-0 p-2 rounded-full transition-calm hover:bg-muted"
            aria-label="View year"
          >
            <Calendar className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>

          {/* Small label - light, uppercase */}
          <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-3">
            Session
          </p>
          
          {/* Primary heading - serif */}
          <h1 className="font-serif text-2xl tracking-tight mb-2">
            {dayName}, {monthDay}
          </h1>
          
          {/* Subtext - light gray */}
          <p className="text-sm font-light text-text-secondary">
            Day {dayOfYear} of {totalDays}
          </p>
        </header>
        
        {/* SESSION STATUS - Single line, centered */}
        <div className="text-center mb-10">
          <p className="text-sm font-light flex items-center justify-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              session.isToday ? "border-2 border-accent-red" : hasData ? "bg-foreground" : "bg-soft-gray"
            }`} />
            {statusText}
          </p>
        </div>
        
        {/* MAIN CONTENT CARD - Soft container */}
        <div 
          className="bg-container rounded-3xl p-8 mb-10 cursor-pointer transition-calm hover:bg-container/80"
          onClick={!isEditing ? handleStartEdit : undefined}
        >
          {!isEditing ? (
            <>
              {/* VIEW MODE */}
              {/* SECTION 1 — TIME SPENT */}
              <section className="mb-10">
                <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2">
                  Time
                </p>
                <p className="font-serif text-3xl tracking-tight">
                  {session.duration_minutes ? `${session.duration_minutes}m` : "—"}
                </p>
              </section>
              
              {/* SECTION 2 — WORKOUT TYPE */}
              <section className="mb-10">
                <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2">
                  Workout Type
                </p>
                <p className="text-base font-light">
                  {session.workout_type || "—"}
                </p>
              </section>
              
              {/* SECTION 3 — EXERCISE LOG */}
              {session.exercises.length > 0 && (
                <section className="mb-10">
                  <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-4">
                    Exercises
                  </p>
                  <div className="space-y-6">
                    {session.exercises.map((exercise, index) => (
                      <div key={index}>
                        {/* Exercise name - serif */}
                        <p className="font-serif text-lg mb-1">
                          {exercise.name}
                        </p>
                        {/* Details */}
                        {(exercise.sets || exercise.reps || exercise.weight) && (
                          <p className="text-sm font-light tracking-tight font-mono text-foreground/80">
                            {exercise.sets && `${exercise.sets} sets`}
                            {exercise.sets && exercise.reps && " × "}
                            {exercise.reps && `${exercise.reps} reps`}
                            {(exercise.sets || exercise.reps) && exercise.weight && " — "}
                            {exercise.weight && `${exercise.weight} kg`}
                          </p>
                        )}
                        {/* Optional note */}
                        {exercise.note && (
                          <p className="text-sm italic text-text-secondary mt-1.5">
                            {exercise.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* SECTION 4 — SESSION NOTES */}
              {session.notes && (
                <section>
                  <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2">
                    Notes
                  </p>
                  <p className="text-sm font-light leading-relaxed">
                    "{session.notes}"
                  </p>
                </section>
              )}

              {/* HINT */}
              <div className="mt-10 pt-6 border-t border-border/30 text-center">
                <p className="text-xs text-text-secondary/60">
                  Tap to edit
                </p>
              </div>
            </>
          ) : (
            <>
              {/* EDIT MODE */}
              <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                {/* Duration */}
                <div>
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

                {/* Workout Type */}
                <div>
                  <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                    Workout Type
                  </label>
                  <input
                    type="text"
                    value={editWorkoutType}
                    onChange={(e) => setEditWorkoutType(e.target.value)}
                    placeholder="Push, Pull, Legs..."
                    className="w-full px-0 py-2 text-base bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
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

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleDoneEdit}
                    className="flex-1 bg-foreground text-background py-3 rounded-full text-sm font-normal transition-calm hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* FOOTER — Time Context, Very Quiet */}
        {!isEditing && (
          <footer className="text-center mt-auto pt-8">
            <p className="text-sm font-light text-text-secondary">
              {hasData ? "You showed up today." : "Every day is an opportunity."}
            </p>
          </footer>
        )}
      </div>
    </AppShell>
  );
}

export default GymSessionDetail;
