import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGymData } from "@/hooks/useGymData";
import { getDateFromDayOfYear, formatDateShort } from "@/lib/dateUtils";
import { format } from "date-fns";

interface YearDotGridProps {
  onViewChange?: () => void;
}

export function YearDotGrid({ onViewChange }: YearDotGridProps) {
  const navigate = useNavigate();
  const { stats, isAttended, isToday, isPast, year } = useGymData();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  // Create array of days for the dot visualization
  const days = Array.from({ length: stats.totalDays }, (_, i) => i + 1);
  
  // Calculate grid dimensions (roughly 20 columns)
  const columns = 20;

  // Navigate to session detail page with YYYY-MM-DD format
  const handleDayClick = (day: number) => {
    const date = getDateFromDayOfYear(day, year);
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`/session/${dateString}`);
  };
  
  return (
    <div className="flex-1 flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-card rounded-2xl p-6">
          {/* Header with dropdown */}
          <div className="mb-4">
            <button 
              onClick={onViewChange}
              className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-calm"
            >
              Year
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.daysRemaining} days / {Math.round(stats.percentRemaining)}% left
            </p>
          </div>
          
          {/* Dot grid visualization */}
          <div className="relative">
            <div 
              className="grid gap-[5px] justify-center"
              style={{ gridTemplateColumns: `repeat(${columns}, 8px)` }}
            >
              {days.map((day) => {
                const attended = isAttended(day);
                const today = isToday(day);
                const past = isPast(day);
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`
                      w-2 h-2 rounded-full transition-calm cursor-pointer
                      ${today 
                        ? "bg-accent-red" 
                        : attended 
                        ? "bg-foreground" 
                        : past 
                        ? "bg-soft-gray" 
                        : "bg-soft-light"
                      }
                      ${hoveredDay === day ? "scale-150" : ""}
                    `}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    aria-label={`Day ${day}${attended ? " - gym attended" : ""}${today ? " - today" : ""}`}
                  />
                );
              })}
            </div>
            
            {/* Tooltip */}
            {hoveredDay && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1.5 rounded-lg text-xs whitespace-nowrap animate-fade-in">
                {formatDateShort(getDateFromDayOfYear(hoveredDay, year))}
                {isAttended(hoveredDay) && " • Gym ✓"}
                {isToday(hoveredDay) && " • Today"}
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-foreground" />
              <span>Gym</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-soft-gray" />
              <span>Rest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-red" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
