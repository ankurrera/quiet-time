import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RootRedirect } from "@/components/RootRedirect";
import GymSessionDetail from "./pages/GymSessionDetail";
import Routines from "./pages/Routines";
import RoutineDetail from "./pages/RoutineDetail";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route
              path="/"
              element={<RootRedirect />}
            />
            <Route
              path="/session/:date"
              element={
                <ProtectedRoute>
                  <GymSessionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines"
              element={
                <ProtectedRoute>
                  <Routines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/:routineId"
              element={
                <ProtectedRoute>
                  <RoutineDetail />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
