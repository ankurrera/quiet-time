import { useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useGymSession } from "@/hooks/useGymSession";
import { formatDuration, formatExerciseDetails } from "@/lib/gymSessionTypes";

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
  const { day } = useParams<{ day: string }>();
  const dayOfYear = day ? parseInt(day, 10) : undefined;
  const { session, totalDays } = useGymSession(dayOfYear);
  
  // Format date for header
  const dayName = session.date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = session.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
  // Determine dot indicator style based on status
  const getDotIndicator = () => {
    if (session.isToday) {
      // Red outline for today (◉)
      return (
        <span className="inline-block w-2 h-2 rounded-full border-2 border-accent-red mr-2" />
      );
    }
    if (session.status === "completed") {
      // Dark filled dot for completed (●)
      return <span className="inline-block w-2 h-2 rounded-full bg-foreground mr-2" />;
    }
    // Light dot for skipped/rest (○)
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-soft-gray mr-2" />
    );
  };
  
  // Get status text
  const getStatusText = () => {
    if (session.status === "completed") return "Workout completed";
    if (session.status === "rest") return "Rest day";
    return "Session skipped";
  };
  
  // Get footer message
  const getFooterMessage = () => {
    if (session.status === "completed") return "You showed up today.";
    return "Rest is part of progress.";
  };

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
            Day {session.dayOfYear} of {totalDays}
          </p>
        </header>
        
        {/* SESSION STATUS - Single line, centered */}
        <div className="text-center mb-10">
          <p className="text-sm font-light flex items-center justify-center">
            {getDotIndicator()}
            {getStatusText()}
          </p>
        </div>
        
        {/* MAIN CONTENT CARD - Soft container */}
        <div className="bg-container rounded-3xl p-8 mb-10">
          {/* SECTION 1 — TIME SPENT */}
          <section className="mb-10">
            <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2">
              Time
            </p>
            <p className="font-serif text-3xl tracking-tight">
              {formatDuration(session.duration || 0)}
            </p>
            {session.status === "completed" && (session.includesWarmup || session.includesCooldown) && (
              <p className="text-xs font-light text-text-secondary mt-2">
                Including warm-up and cooldown
              </p>
            )}
          </section>
          
          {/* SECTION 2 — WORKOUT TYPE */}
          <section className="mb-10">
            <p className="text-base font-light">
              {session.workoutTypes.join(" • ")}
            </p>
          </section>
          
          {/* SECTION 3 — EXERCISE LOG */}
          {session.exercises.length > 0 && (
            <section className="mb-10">
              <div className="space-y-8">
                {session.exercises.map((exercise, index) => (
                  <div key={index}>
                    {/* Exercise name - serif */}
                    <p className="font-serif text-lg mb-1">
                      {exercise.name}
                    </p>
                    {/* Details - monospaced/tight */}
                    <p className="text-sm font-light tracking-tight font-mono text-foreground/80">
                      {formatExerciseDetails(exercise)}
                    </p>
                    {/* Optional note - italic, gray */}
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
          
          {/* SECTION 4 — SESSION NOTES (only if present) */}
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
        </div>
        
        {/* FOOTER — Time Context, Very Quiet */}
        <footer className="text-center mt-auto pt-8">
          <p className="text-sm font-light text-text-secondary">
            {getFooterMessage()}
          </p>
        </footer>
      </div>
    </AppShell>
  );
}

export default GymSessionDetail;
