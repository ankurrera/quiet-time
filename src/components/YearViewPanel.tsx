import { useState } from "react";
import { X } from "lucide-react";
import { YearDotGrid } from "./views/YearDotGrid";
import { YearProgressBar } from "./views/YearProgressBar";

interface YearViewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = "bar" | "grid";

/**
 * Year View Panel
 * Slide-in panel showing year progress visualizations
 * Provides invisible navigation through time
 */
export function YearViewPanel({ isOpen, onClose }: YearViewPanelProps) {
  const [currentView, setCurrentView] = useState<View>("bar");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 top-0 bottom-0 bg-background z-50 animate-slide-in-from-bottom flex flex-col">
        {/* Close button */}
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-calm hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* Year view content */}
        {currentView === "bar" ? (
          <YearProgressBar onViewChange={() => setCurrentView("grid")} />
        ) : (
          <YearDotGrid onViewChange={() => setCurrentView("bar")} />
        )}
      </div>
    </>
  );
}
