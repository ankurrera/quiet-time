import { ChevronDown } from "lucide-react";
import { useGymData } from "@/hooks/useGymData";

interface YearProgressBarProps {
  onViewChange?: () => void;
}

export function YearProgressBar({ onViewChange }: YearProgressBarProps) {
  const { stats, isAttended, isToday, isPast, year } = useGymData();
  
  // Create array of days for the bar visualization
  const days = Array.from({ length: stats.totalDays }, (_, i) => i + 1);
  
  // Group days for the bar (show ~50 lines for visual clarity)
  const groupSize = Math.ceil(stats.totalDays / 50);
  const groupedDays = [];
  
  for (let i = 0; i < days.length; i += groupSize) {
    const group = days.slice(i, i + groupSize);
    const hasToday = group.some(isToday);
    const attendedCount = group.filter(d => isAttended(d)).length;
    const pastCount = group.filter(d => isPast(d)).length;
    const attendanceRatio = pastCount > 0 ? attendedCount / pastCount : 0;
    
    groupedDays.push({
      index: i,
      hasToday,
      attendanceRatio,
      isPast: group.some(isPast),
      isFuture: group.every(d => d > stats.today),
    });
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-card rounded-2xl p-6">
          {/* Header with dropdown */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <button 
                onClick={onViewChange}
                className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-calm"
              >
                Year Progress
                <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                {year} is {stats.percentComplete.toFixed(1)}% complete
              </p>
            </div>
            
            {/* Percentage circle */}
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              <span className="text-xs font-medium">{Math.round(stats.percentComplete)}%</span>
            </div>
          </div>
          
          {/* Progress bar visualization */}
          <div className="my-8">
            <div className="flex items-end justify-center gap-[2px] h-16">
              {groupedDays.map((group, idx) => (
                <div
                  key={idx}
                  className={`w-[3px] rounded-full transition-calm ${
                    group.hasToday
                      ? "bg-accent-green h-full"
                      : group.isFuture
                      ? "bg-soft-light h-8"
                      : group.attendanceRatio > 0.5
                      ? "bg-accent-green h-10"
                      : "bg-soft-gray h-8"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Days remaining */}
          <p className="text-center text-sm text-muted-foreground">
            {stats.daysRemaining} days left
          </p>
        </div>
      </div>
    </div>
  );
}
