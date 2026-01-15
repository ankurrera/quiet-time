import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGymData } from "@/hooks/useGymData";
import { getDateFromDayOfYear } from "@/lib/dateUtils";
import { format } from "date-fns";

interface YearProgressBarProps {
  onViewChange?: () => void;
}

export function YearProgressBar({ onViewChange }: YearProgressBarProps) {
  const navigate = useNavigate();
  const { stats, isAttended, isToday, isPast, year } = useGymData();
  const barRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
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
      midDay: group[Math.floor(group.length / 2)],
    });
  }

  // Handle click on progress bar to navigate to that day
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = x / width;
    
    // Calculate day of year from click position
    const dayOfYear = Math.max(1, Math.min(Math.floor(clickPercentage * stats.totalDays) + 1, stats.totalDays));
    
    // Navigate to that day's session
    const date = getDateFromDayOfYear(dayOfYear, year);
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`/session/${dateString}`);
  };

  // Handle hover to show which day
  const handleBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const hoverPercentage = x / width;
    
    const dayOfYear = Math.max(1, Math.min(Math.floor(hoverPercentage * stats.totalDays) + 1, stats.totalDays));
    setHoveredDay(dayOfYear);
  };

  const handleBarLeave = () => {
    setHoveredDay(null);
  };

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
          
          {/* Progress bar visualization - Interactive */}
          <div className="my-8 relative">
            <div 
              ref={barRef}
              className="flex items-end justify-center gap-[2px] h-16 cursor-pointer"
              onClick={handleBarClick}
              onMouseMove={handleBarHover}
              onMouseLeave={handleBarLeave}
            >
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
            
            {/* Tooltip */}
            {hoveredDay && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1.5 rounded-lg text-xs whitespace-nowrap animate-fade-in">
                Day {hoveredDay} • Click to view
              </div>
            )}
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
