/**
 * Gym Session Types
 * Types for the gym session detail page
 */

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number; // in kg
  note?: string;
}

export type SessionStatus = "completed" | "skipped" | "rest";

export interface GymSession {
  date: Date;
  dayOfYear: number;
  status: SessionStatus;
  isToday: boolean;
  duration?: number; // in minutes
  includesWarmup?: boolean;
  includesCooldown?: boolean;
  workoutTypes: string[];
  exercises: Exercise[];
  notes?: string;
}

/**
 * Format duration in minutes to human readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "1h 15m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format exercise details as "4 × 8 — 60 kg"
 */
export function formatExerciseDetails(exercise: Exercise): string {
  return `${exercise.sets} × ${exercise.reps}   —   ${exercise.weight} kg`;
}
