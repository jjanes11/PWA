/**
 * Formats duration in minutes to human-readable string.
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 15m" or "45m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Formats weight value.
 * @param kg - Weight in kilograms
 * @returns Formatted string like "100 kg"
 */
export function formatWeight(kg: number): string {
  return `${Math.round(kg)} kg`;
}

/**
 * Formats repetition count.
 * @param reps - Number of repetitions
 * @returns Formatted string like "45 reps"
 */
export function formatReps(reps: number): string {
  return `${Math.round(reps)} reps`;
}

/**
 * Formats a metric value with relative time.
 * @param value - Numeric value
 * @param metricType - Type of metric ('duration', 'volume', 'reps', 'weight')
 * @param relativeTime - Relative time string like "2 days ago"
 * @returns Formatted string like "2h 15m 3 weeks ago"
 */
export function formatMetricWithTime(
  value: number, 
  metricType: 'duration' | 'volume' | 'reps' | 'weight',
  relativeTime: string
): string {
  let formattedValue: string;
  
  switch (metricType) {
    case 'duration':
      formattedValue = formatDuration(value);
      break;
    case 'volume':
    case 'weight':
      formattedValue = formatWeight(value);
      break;
    case 'reps':
      formattedValue = formatReps(value);
      break;
    default:
      formattedValue = `${Math.round(value)}`;
  }
  
  return `${formattedValue} ${relativeTime}`;
}
