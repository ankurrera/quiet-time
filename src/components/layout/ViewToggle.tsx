interface ViewToggleProps {
  currentView: "bar" | "grid";
  onViewChange: (view: "bar" | "grid") => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center pb-8 pt-4">
      <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
        <button
          onClick={() => onViewChange("bar")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-calm ${
            currentView === "bar"
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Progress
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-calm ${
            currentView === "grid"
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Grid
        </button>
      </div>
    </div>
  );
}
