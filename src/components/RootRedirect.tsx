import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

/**
 * Root redirect component
 * Handles the default entry point for authenticated users
 * 
 * Behavior:
 * - Unauthenticated users → /auth
 * - Authenticated without profile → /profile-setup
 * - Authenticated with profile → /session/YYYY-MM-DD (today)
 */
export function RootRedirect() {
  const { user, profile, isLoading, isInitialized } = useAuth();

  // Show loading while checking auth state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but no profile - redirect to profile setup
  if (!profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Logged in with profile - redirect to today's session
  const today = format(new Date(), "yyyy-MM-dd");
  return <Navigate to={`/session/${today}`} replace />;
}
