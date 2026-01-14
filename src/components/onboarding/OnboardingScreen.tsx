import { ReactNode } from "react";

interface OnboardingScreenProps {
  children: ReactNode;
  illustration?: ReactNode;
  subtitle?: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function OnboardingScreen({
  children,
  illustration,
  subtitle,
  buttonText,
  onButtonClick,
}: OnboardingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-muted animate-fade-in">
      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-16">
        {/* Main text */}
        <h1 className="font-serif text-2xl md:text-3xl text-center leading-relaxed max-w-[280px] text-foreground">
          {children}
        </h1>
        
        {/* Illustration */}
        {illustration && (
          <div className="my-16 text-foreground">
            {illustration}
          </div>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-muted-foreground text-center italic mt-8">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Bottom button */}
      <div className="p-6 pb-10">
        <button
          onClick={onButtonClick}
          className="w-full bg-foreground text-background py-4 rounded-full text-sm font-normal transition-calm hover:opacity-90"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
