import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { ViewToggle } from "@/components/layout/ViewToggle";
import { YearProgressBar } from "@/components/views/YearProgressBar";
import { YearDotGrid } from "@/components/views/YearDotGrid";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

type View = "bar" | "grid";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has seen onboarding
    return !localStorage.getItem("tempo-onboarding-complete");
  });
  
  const [currentView, setCurrentView] = useState<View>("bar");

  const handleOnboardingComplete = () => {
    localStorage.setItem("tempo-onboarding-complete", "true");
    setShowOnboarding(false);
  };

  // Show onboarding if not complete
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppShell>
      <Header />
      
      {currentView === "bar" ? (
        <YearProgressBar onViewChange={() => setCurrentView("grid")} />
      ) : (
        <YearDotGrid onViewChange={() => setCurrentView("bar")} />
      )}
      
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
    </AppShell>
  );
};

export default Index;
