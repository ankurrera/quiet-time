import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useRoutines } from "@/hooks/useRoutines";
import { format } from "date-fns";

/**
 * Routines List Page
 * 
 * Design Philosophy:
 * - Minimal vertical list
 * - No icons, no cards, no color emphasis
 * - Text-only, calm interface
 */
export function Routines() {
  const navigate = useNavigate();
  const { routines, isLoading, createRoutine } = useRoutines();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineFocus, setNewRoutineFocus] = useState("");

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) return;

    const result = await createRoutine(newRoutineName.trim(), newRoutineFocus.trim() || undefined);
    if (result.success && result.data) {
      setIsCreating(false);
      setNewRoutineName("");
      setNewRoutineFocus("");
      navigate(`/routines/${result.data.id}`);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewRoutineName("");
    setNewRoutineFocus("");
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    navigate(`/session/${today}`);
  };

  if (isLoading) {
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
        {/* HEADER */}
        <header className="text-center mb-10">
          <p className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-3">
            Your Routines
          </p>
          <h1 className="font-serif text-2xl tracking-tight mb-2">
            Workout Templates
          </h1>
          <p className="text-sm font-light text-text-secondary">
            Define structure, log reality
          </p>
        </header>

        {/* ROUTINES LIST */}
        <div className="flex-1 space-y-6 mb-8">
          {routines.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <p className="text-sm font-light text-text-secondary mb-6">
                No routines yet
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="text-sm font-light underline underline-offset-4 transition-calm hover:text-foreground"
              >
                Create your first routine
              </button>
            </div>
          )}

          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => navigate(`/routines/${routine.id}`)}
              className="w-full text-left bg-container rounded-3xl p-6 transition-calm hover:bg-container/80"
            >
              <h2 className="font-serif text-xl tracking-tight mb-1">
                {routine.name}
              </h2>
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

          {/* CREATE NEW ROUTINE FORM */}
          {isCreating && (
            <div className="bg-container rounded-3xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    placeholder="Push Day, Pull Day..."
                    className="w-full px-0 py-2 text-lg bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-light uppercase tracking-[0.2em] text-text-secondary mb-2 block">
                    Focus (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRoutineFocus}
                    onChange={(e) => setNewRoutineFocus(e.target.value)}
                    placeholder="Upper body, Chest & Triceps..."
                    className="w-full px-0 py-2 text-sm bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-secondary text-foreground py-3 rounded-full text-sm font-normal transition-calm hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRoutine}
                    disabled={!newRoutineName.trim()}
                    className="flex-1 bg-foreground text-background py-3 rounded-full text-sm font-normal transition-calm hover:opacity-90 disabled:opacity-40"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="space-y-4">
          {!isCreating && routines.length > 0 && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-4 text-sm font-light text-foreground transition-calm hover:text-text-secondary"
            >
              + New routine
            </button>
          )}

          <div className="pt-4 border-t border-border/30">
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

export default Routines;
