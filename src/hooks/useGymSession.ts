import { useMemo } from "react";
import { getDayOfYear, getDateFromDayOfYear, getDaysInYear } from "@/lib/dateUtils";
import type { GymSession, Exercise, SessionStatus } from "@/lib/gymSessionTypes";

/**
 * Generate mock session data for a specific day
 */
function generateMockSession(dayOfYear: number, year: number): GymSession {
  const date = getDateFromDayOfYear(dayOfYear, year);
  const today = getDayOfYear(new Date());
  const isToday = dayOfYear === today;
  const dayOfWeek = date.getDay();
  
  // Determine status based on day patterns
  // Rest days on Sunday (0) or if randomly selected
  const isRestDay = dayOfWeek === 0 || (dayOfWeek === 6 && Math.random() < 0.3);
  
  // For future days or randomly skipped
  const isFuture = dayOfYear > today;
  const isSkipped = !isFuture && !isRestDay && Math.random() < 0.1;
  
  let status: SessionStatus;
  if (isRestDay) {
    status = "rest";
  } else if (isSkipped || isFuture) {
    status = "skipped";
  } else {
    status = "completed";
  }
  
  // Generate workout data for completed sessions
  const workoutTypes = generateWorkoutTypes(dayOfWeek);
  const exercises = status === "completed" ? generateExercises(workoutTypes) : [];
  const duration = status === "completed" ? 60 + Math.floor(Math.random() * 30) : 0;
  
  return {
    date,
    dayOfYear,
    status,
    isToday,
    duration,
    includesWarmup: status === "completed",
    includesCooldown: status === "completed",
    workoutTypes: status === "rest" ? ["Recovery", "Mobility"] : workoutTypes,
    exercises,
    notes: generateNotes(status),
  };
}

function generateWorkoutTypes(dayOfWeek: number): string[] {
  const workoutSchedule: Record<number, string[]> = {
    1: ["Push", "Chest", "Triceps"], // Monday
    2: ["Pull", "Back", "Biceps"],   // Tuesday
    3: ["Legs", "Glutes"],           // Wednesday
    4: ["Push", "Shoulders"],        // Thursday
    5: ["Pull", "Back", "Biceps"],   // Friday
    6: ["Legs", "Core"],             // Saturday
    0: ["Recovery", "Mobility"],     // Sunday
  };
  return workoutSchedule[dayOfWeek] || ["Full Body"];
}

function generateExercises(workoutTypes: string[]): Exercise[] {
  const exercisesByType: Record<string, Exercise[]> = {
    Push: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 60, note: "Felt strong today" },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 22 },
      { name: "Cable Flyes", sets: 3, reps: 12, weight: 15 },
    ],
    Chest: [
      { name: "Dumbbell Pullover", sets: 3, reps: 12, weight: 20 },
    ],
    Triceps: [
      { name: "Tricep Pushdown", sets: 3, reps: 12, weight: 25 },
      { name: "Overhead Extension", sets: 3, reps: 10, weight: 15 },
    ],
    Pull: [
      { name: "Deadlift", sets: 4, reps: 5, weight: 100 },
      { name: "Barbell Row", sets: 4, reps: 8, weight: 60 },
      { name: "Lat Pulldown", sets: 3, reps: 10, weight: 50 },
    ],
    Back: [
      { name: "Seated Row", sets: 3, reps: 10, weight: 55 },
    ],
    Biceps: [
      { name: "Barbell Curl", sets: 3, reps: 10, weight: 25 },
      { name: "Hammer Curl", sets: 3, reps: 12, weight: 12 },
    ],
    Legs: [
      { name: "Squat", sets: 4, reps: 8, weight: 80, note: "Depth was good" },
      { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 60 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 120 },
      { name: "Leg Curl", sets: 3, reps: 12, weight: 40 },
    ],
    Glutes: [
      { name: "Hip Thrust", sets: 3, reps: 12, weight: 70 },
    ],
    Shoulders: [
      { name: "Overhead Press", sets: 4, reps: 8, weight: 40 },
      { name: "Lateral Raise", sets: 3, reps: 15, weight: 8 },
      { name: "Face Pull", sets: 3, reps: 15, weight: 20 },
    ],
    Core: [
      { name: "Plank", sets: 3, reps: 60, weight: 0, note: "Seconds hold" },
      { name: "Cable Crunch", sets: 3, reps: 15, weight: 30 },
    ],
  };

  const exercises: Exercise[] = [];
  for (const type of workoutTypes) {
    const typeExercises = exercisesByType[type];
    if (typeExercises) {
      exercises.push(...typeExercises);
    }
  }
  
  return exercises;
}

function generateNotes(status: SessionStatus): string | undefined {
  if (status !== "completed") return undefined;
  
  const notes = [
    "Energy was low initially, improved after second set.",
    "Good session overall. Increased weight on main lifts.",
    "Focused on form today. Felt controlled throughout.",
    undefined,
    undefined, // Sometimes no notes
    undefined,
  ];
  
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Hook to get gym session data for a specific day
 */
export function useGymSession(dayOfYear?: number) {
  const currentYear = new Date().getFullYear();
  const today = getDayOfYear(new Date());
  const targetDay = dayOfYear ?? today;
  
  const session = useMemo(() => {
    // Ensure day is within valid range
    const totalDays = getDaysInYear(currentYear);
    const validDay = Math.max(1, Math.min(targetDay, totalDays));
    return generateMockSession(validDay, currentYear);
  }, [targetDay, currentYear]);
  
  return {
    session,
    year: currentYear,
    totalDays: getDaysInYear(currentYear),
  };
}
