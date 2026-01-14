import { useState, useMemo } from "react";
import { getDayOfYear, getDaysInYear } from "@/lib/dateUtils";

export interface GymDay {
  dayOfYear: number;
  attended: boolean;
}

// Generate mock gym data - in a real app this would come from a database
function generateMockGymData(year: number): Set<number> {
  const attended = new Set<number>();
  const today = getDayOfYear(new Date());
  
  // Generate realistic gym attendance pattern (about 4 days per week)
  for (let day = 1; day <= today; day++) {
    const dayOfWeek = new Date(year, 0, day).getDay();
    // Higher chance on weekdays, some rest days
    const baseChance = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0.7;
    // Add some randomness
    if (Math.random() < baseChance) {
      attended.add(day);
    }
  }
  
  return attended;
}

export function useGymData() {
  const currentYear = new Date().getFullYear();
  const [attendedDays] = useState(() => generateMockGymData(currentYear));
  
  const today = getDayOfYear(new Date());
  const totalDays = getDaysInYear(currentYear);
  
  const stats = useMemo(() => {
    const daysAttended = attendedDays.size;
    const attendanceRate = today > 0 ? (daysAttended / today) * 100 : 0;
    
    return {
      daysAttended,
      today,
      totalDays,
      daysRemaining: totalDays - today,
      percentRemaining: ((totalDays - today) / totalDays) * 100,
      percentComplete: (today / totalDays) * 100,
      attendanceRate,
    };
  }, [attendedDays, today, totalDays]);
  
  const isAttended = (dayOfYear: number) => attendedDays.has(dayOfYear);
  const isToday = (dayOfYear: number) => dayOfYear === today;
  const isPast = (dayOfYear: number) => dayOfYear < today;
  const isFuture = (dayOfYear: number) => dayOfYear > today;
  
  return {
    attendedDays,
    stats,
    isAttended,
    isToday,
    isPast,
    isFuture,
    year: currentYear,
  };
}
