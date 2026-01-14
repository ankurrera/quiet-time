import { Info } from "lucide-react";

interface HeaderProps {
  showInfo?: boolean;
  onInfoClick?: () => void;
}

export function Header({ showInfo = true, onInfoClick }: HeaderProps) {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = now.getFullYear();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex-1" />
      <div className="text-center">
        <p className="font-serif text-lg tracking-tight">
          {dayName}, {monthDay} {year}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
      <div className="flex-1 flex justify-end">
        {showInfo && (
          <button
            onClick={onInfoClick}
            className="p-2 rounded-full transition-calm hover:bg-muted"
            aria-label="Info"
          >
            <Info className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </header>
  );
}
