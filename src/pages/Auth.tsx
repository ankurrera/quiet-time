import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/lib/authTypes";
import { format } from "date-fns";

type AuthMode = "signin" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isInitialized, signIn, signUp, signInWithMagicLink } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (isInitialized && user) {
      if (profile) {
        // Redirect to today's session
        const today = format(new Date(), "yyyy-MM-dd");
        navigate(`/session/${today}`, { replace: true });
      } else {
        navigate("/profile-setup", { replace: true });
      }
    }
  }, [isInitialized, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error ?? null);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error ?? null);
      return;
    }

    setIsSubmitting(true);

    const result = mode === "signin" 
      ? await signIn(email, password)
      : await signUp(email, password);

    setIsSubmitting(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleMagicLink = async () => {
    setError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error ?? null);
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithMagicLink(email);
    setIsSubmitting(false);

    if (result.success) {
      setMagicLinkSent(true);
    } else if (result.error) {
      setError(result.error);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setMagicLinkSent(false);
  };

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  // If magic link was sent, show confirmation
  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background animate-fade-in">
        <div className="w-full max-w-sm space-y-8 text-center">
          <h1 className="font-serif text-3xl text-foreground">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a link to {email}.<br />
            Click it to sign in—no password needed.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline transition-calm"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background animate-fade-in">
      <div className="w-full max-w-sm space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl text-foreground">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "signin" 
              ? "Sign in to continue your journal" 
              : "Start your quiet time journey"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="space-y-2">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm disabled:opacity-50"
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-calm disabled:opacity-50"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-muted-foreground animate-fade-in">
              {error}
            </p>
          )}

          {/* Primary button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background py-4 rounded-full text-sm font-normal transition-calm hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Continue"}
          </button>
        </form>

        {/* Magic link option */}
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isSubmitting}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline transition-calm disabled:opacity-50"
          >
            Use magic link instead
          </button>

          {/* Mode switch */}
          <div className="text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="underline-offset-4 hover:underline transition-calm"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="underline-offset-4 hover:underline transition-calm"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/70">
          Your data stays private to your account.
        </p>
      </div>
    </div>
  );
}
