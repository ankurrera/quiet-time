import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useGymSession } from "@/hooks/useGymSession";
import { format, parse } from "date-fns";

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
  
  // Validate and use date parameter, default to today
  const dateString = dateParam || format(new Date(), "yyyy-MM-dd");
  const { session, isLoading, saveSession } = useGymSession(dateString);
  
  // Parse date for display
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  const dayName = format(date, "EEEE");
  const monthDay = format(date, "MMM d");
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = date.getFullYear() % 4 === 0 ? 366 : 365;

  // Local state for editing
  const [editDuration, setEditDuration] = useState<string>("");
  const [editWorkoutType, setEditWorkoutType] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // When entering edit mode, populate local state
  const handleStartEdit = () => {
    if (session) {
      setEditDuration(session.duration_minutes?.toString() || "");
      setEditWorkoutType(session.workout_type || "");
      setEditNotes(session.notes || "");
      setIsEditing(true);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!session) return;

    const updates = {
      duration_minutes: editDuration ? parseInt(editDuration, 10) : null,
      workout_type: editWorkoutType || null,
      notes: editNotes || null,
    };

    const result = await saveSession(updates);
    if (result.success) {
      setIsEditing(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
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
      <div className="flex-1 flex flex-col px-6 py-12 animate-fade-in max-w-md mx-auto w-full">
        {/* HEADER - Very Subtle, Centered */}
        <header className="text-center mb-10">
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
                    onClick={handleSave}
                    className="flex-1 bg-foreground text-background py-3 rounded-full text-sm font-normal transition-calm hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-transparent border border-border text-foreground py-3 rounded-full text-sm font-normal transition-calm hover:bg-container"
                  >
                    Cancel
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
