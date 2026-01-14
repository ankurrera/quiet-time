import { useState } from "react";
import { OnboardingScreen } from "./OnboardingScreen";
import { PeopleIllustration } from "./illustrations/PeopleIllustration";
import { MeditationIllustration } from "./illustrations/MeditationIllustration";
import { AppIcon } from "./illustrations/AppIcon";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const screens = [
    {
      content: (
        <>
          Less rush. Less stress. More room for what matters.
        </>
      ),
      illustration: <PeopleIllustration />,
      subtitle: "For health, discipline, and self-respect",
      buttonText: "Wait…",
    },
    {
      content: (
        <>
          Consistency turns effort into progress you can see.
        </>
      ),
      illustration: <MeditationIllustration />,
      subtitle: "Awareness changes how discipline feels...",
      buttonText: "Next",
    },
    {
      content: (
        <>
          Give time the value it deserves and make the most out of it
        </>
      ),
      illustration: (
        <div className="flex flex-col items-center gap-3">
          <AppIcon />
          <p className="text-xs text-muted-foreground mt-2">Tempo – Gym Tracker</p>
        </div>
      ),
      subtitle: undefined,
      buttonText: "Get started",
    },
  ];

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentScreen = screens[step];

  return (
    <OnboardingScreen
      illustration={currentScreen.illustration}
      subtitle={currentScreen.subtitle}
      buttonText={currentScreen.buttonText}
      onButtonClick={handleNext}
    >
      {currentScreen.content}
    </OnboardingScreen>
  );
}
