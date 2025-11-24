import { Workout } from '../models/workout.models';
import { TimeRange } from '../models/analytics.models';

/**
 * Filters workouts by the specified time range.
 * Only returns completed workouts within the date range.
 */
export function filterWorkoutsByRange(workouts: Workout[], range: TimeRange): Workout[] {
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (range) {
    case 'Last 3 months':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'Year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'All time':
      return workouts.filter(w => w.completed);
  }
  
  return workouts.filter(w => w.completed && new Date(w.date) >= cutoffDate);
}

/**
 * Converts a relative date string to a human-readable format.
 * @param dateStr - Date in format "Nov 15" or similar
 * @returns Relative time string like "2 days ago", "3 weeks ago", etc.
 */
export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const parsedDate = new Date(`${dateStr}, ${currentYear}`);
  
  // If parsed date is in the future, it's probably from last year
  if (parsedDate > now) {
    parsedDate.setFullYear(currentYear - 1);
  }
  
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

/**
 * Formats a date for chart display.
 * @param date - JavaScript Date object
 * @returns Formatted string like "Nov 15"
 */
export function formatChartDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Gets workouts from the last 7 days.
 */
export function getLastWeekWorkouts(workouts: Workout[]): Workout[] {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= oneWeekAgo && workout.completed;
  });
}
