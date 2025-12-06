import { ExerciseMetricType } from '../models/analytics.models';

/**
 * Get human-readable description for each metric type
 */
export function getMetricDescription(metric: ExerciseMetricType): string {
  const descriptions: Record<ExerciseMetricType, string> = {
    // Weight-based metrics
    heaviest: 'The highest weight lifted across all sets in each workout. Tracks your strength progression over time.',
    lightest: 'The lowest assistance weight used in each workout. Lower values indicate improved strength (less assistance needed).',
    
    // Rep-based metrics
    mostReps: 'The highest number of reps completed in a single set during each workout. Shows your muscular endurance progress.',
    totalReps: 'The sum of all reps across all sets in each workout. Indicates overall workout training volume.',
    
    // Volume metrics
    oneRepMax: 'Estimated maximum weight you could lift for one rep, calculated using the Epley formula: weight × (1 + reps/30). Predicts peak strength.',
    bestSetVolume: 'The highest volume (weight × reps) achieved in a single set during each workout. Combines strength and endurance.',
    workoutVolume: 'Total volume (sum of weight × reps for all sets) in each workout. Tracks overall training load.',
    
    // Time-based metrics
    bestTime: 'The longest duration held in a single set during each workout. Shows your muscular endurance improvement.',
    totalTime: 'The sum of all set durations in each workout. Indicates workout time under tension.',
    
    // Distance-based metrics
    longestDistance: 'The furthest distance covered in a single set during each workout. Tracks your endurance capacity.',
    totalDistance: 'The sum of all distances covered across all sets in each workout. Shows workout training volume.',
    distanceVolume: 'Weighted distance (sum of weight × distance for all sets) in each workout. Combines load and distance for loaded carries.'
  };
  
  return descriptions[metric] || '';
}
