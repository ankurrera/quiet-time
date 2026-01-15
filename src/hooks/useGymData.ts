import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { getDayOfYear, getDaysInYear, getDateFromDayOfYear } from "@/lib/dateUtils";
import { format } from "date-fns";

export interface GymDay {
  dayOfYear: number;
  attended: boolean;
}

/**
 * Hook to fetch and manage gym attendance data for the year
 * Fetches from Supabase gym_sessions table
 */
export function useGymData() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [attendedDays, setAttendedDays] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  const today = getDayOfYear(new Date());
  const totalDays = getDaysInYear(currentYear);

  // Fetch gym sessions from Supabase
  useEffect(() => {
    if (!user) {
      setAttendedDays(new Set());
      setIsLoading(false);
      return;
    }

    const fetchGymSessions = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all sessions for current year
        const startDate = format(new Date(currentYear, 0, 1), "yyyy-MM-dd");
        const endDate = format(new Date(currentYear, 11, 31), "yyyy-MM-dd");

        const { data, error } = await supabase
          .from("gym_sessions")
          .select("session_date")
          .eq("user_id", user.id)
          .gte("session_date", startDate)
          .lte("session_date", endDate);

        if (error) {
          console.error("Error fetching gym sessions:", error);
          setAttendedDays(new Set());
        } else if (data) {
          // Convert session dates to day of year
          const attended = new Set<number>();
          data.forEach((session) => {
            const date = new Date(session.session_date);
            const dayOfYear = getDayOfYear(date);
            attended.add(dayOfYear);
          });
          setAttendedDays(attended);
        }
      } catch (err) {
        console.error("Error in fetchGymSessions:", err);
        setAttendedDays(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchGymSessions();
  }, [user, currentYear]);
  
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
    isLoading,
  };
}
