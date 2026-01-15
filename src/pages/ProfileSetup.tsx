import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const WEEKLY_GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isInitialized, createProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [gymStartDate, setGymStartDate] = useState<Date | undefined>(undefined);
  const [weeklyGoal, setWeeklyGoal] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Redirect if not logged in or already has profile
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (profile) {
        // Redirect to today's session
        const today = format(new Date(), "yyyy-MM-dd");
        navigate(`/session/${today}`, { replace: true });
      }
    }
  }, [isInitialized, isLoading, user, profile, navigate]);

  const submitProfile = async () => {
    setError(null);

    if (!preferredName.trim()) {
      setError("Please enter what you'd like to be called.");
      return;
    }

    setIsSubmitting(true);

    const result = await createProfile({
      full_name: fullName.trim() || null,
      preferred_name: preferredName.trim(),
      gym_start_date: gymStartDate ? format(gymStartDate, "yyyy-MM-dd") : null,
      weekly_goal: weeklyGoal ?? null,
    });

    setIsSubmitting(false);

    if (result.success) {
      // Redirect to today's session
      const today = format(new Date(), "yyyy-MM-dd");
      navigate(`/session/${today}`, { replace: true });
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProfile();
  };

  // Show loading while checking auth state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  // Don't render if redirecting
  if (!user || profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background animate-fade-in">
      <div className="w-full max-w-sm space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl text-foreground">
            Let's set your baseline
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This helps frame your time, not judge it.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full name (optional) */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs text-muted-foreground">
              Full name <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm disabled:opacity-50"
            />
          </div>

          {/* Preferred name (required) */}
          <div className="space-y-2">
            <label htmlFor="preferredName" className="text-xs text-muted-foreground">
              What should we call you?
            </label>
            <input
              id="preferredName"
              type="text"
              placeholder="Your preferred name"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="given-name"
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm disabled:opacity-50"
            />
          </div>

          {/* Gym start date */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              When did you start going to the gym?
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="w-full px-0 py-3 text-left text-base bg-transparent border-0 border-b border-border text-foreground focus:outline-none focus:border-foreground transition-calm disabled:opacity-50"
                >
                  {gymStartDate ? (
                    format(gymStartDate, "MMMM d, yyyy")
                  ) : (
                    <span className="text-muted-foreground">Select a date</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border" align="start">
                <Calendar
                  mode="single"
                  selected={gymStartDate}
                  onSelect={(date) => {
                    setGymStartDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Weekly goal */}
          <div className="space-y-4">
            <label className="text-xs text-muted-foreground">
              How many days per week do you aim for?
            </label>
            <div className="flex gap-2 justify-between">
              {WEEKLY_GOAL_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setWeeklyGoal(weeklyGoal === days ? undefined : days)}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 text-sm rounded-lg transition-calm border ${
                    weeklyGoal === days
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-border hover:border-foreground/50"
                  } disabled:opacity-50`}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-muted-foreground animate-fade-in">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background py-4 rounded-full text-sm font-normal transition-calm hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Save and continue"}
          </button>
        </form>

        {/* Skip option */}
        <div className="text-center">
          <button
            type="button"
            onClick={submitProfile}
            disabled={isSubmitting}
            className="text-sm text-muted-foreground/70 underline-offset-4 hover:underline transition-calm disabled:opacity-50"
          >
            Skip other fields
          </button>
        </div>
      </div>
    </div>
  );
}
