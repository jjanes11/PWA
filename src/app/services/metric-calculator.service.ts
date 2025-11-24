import { Injectable } from '@angular/core';
import { Workout, Exercise, Set } from '../models/workout.models';

export type WorkoutMetricType = 'duration' | 'volume' | 'reps';
export type ExerciseMetricType = 'heaviest' | 'oneRepMax' | 'bestSetVolume' | 'workoutVolume' | 'totalReps';

@Injectable({
  providedIn: 'root'
})
export class MetricCalculatorService {
  
  /**
   * Calculate duration metric for a workout.
   */
  calculateDuration(workout: Workout): number {
    return workout.duration || 0;
  }
  
  /**
   * Calculate total volume (weight × reps) for a workout.
   */
  calculateVolume(workout: Workout): number {
    return workout.exercises.reduce((sum, exercise) => {
      return sum + exercise.sets.reduce((setSum, set) => {
        return setSum + (set.weight || 0) * (set.reps || 0);
      }, 0);
    }, 0);
  }
  
  /**
   * Calculate total reps for a workout.
   */
  calculateReps(workout: Workout): number {
    return workout.exercises.reduce((sum, exercise) => {
      return sum + exercise.sets.reduce((setSum, set) => {
        return setSum + (set.reps || 0);
      }, 0);
    }, 0);
  }
  
  /**
   * Calculate metric value for a workout based on type.
   */
  calculateWorkoutMetric(workout: Workout, metric: WorkoutMetricType): number {
    switch (metric) {
      case 'duration':
        return this.calculateDuration(workout);
      case 'volume':
        return this.calculateVolume(workout);
      case 'reps':
        return this.calculateReps(workout);
      default:
        return 0;
    }
  }
  
  /**
   * Calculate heaviest weight lifted in an exercise.
   */
  private calculateHeaviest(exercise: Exercise): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    if (completedSets.length === 0) return 0;
    return Math.max(...completedSets.map(s => s.weight));
  }
  
  /**
   * Calculate estimated one-rep max using Brzycki formula.
   */
  private calculateOneRepMax(exercise: Exercise): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    if (completedSets.length === 0) return 0;
    
    return Math.max(...completedSets.map(set => 
      set.weight / (1.0278 - 0.0278 * set.reps)
    ));
  }
  
  /**
   * Calculate best single set volume (weight × reps).
   */
  private calculateBestSetVolume(exercise: Exercise): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    if (completedSets.length === 0) return 0;
    return Math.max(...completedSets.map(s => s.weight * s.reps));
  }
  
  /**
   * Calculate total volume for all sets in an exercise.
   */
  private calculateWorkoutVolume(exercise: Exercise): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    return completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  }
  
  /**
   * Calculate total reps for an exercise.
   */
  private calculateTotalReps(exercise: Exercise): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    return completedSets.reduce((sum, set) => sum + set.reps, 0);
  }
  
  /**
   * Calculate metric value for an exercise based on type.
   */
  calculateExerciseMetric(exercise: Exercise, metric: ExerciseMetricType): number {
    switch (metric) {
      case 'heaviest':
        return this.calculateHeaviest(exercise);
      case 'oneRepMax':
        return this.calculateOneRepMax(exercise);
      case 'bestSetVolume':
        return this.calculateBestSetVolume(exercise);
      case 'workoutVolume':
        return this.calculateWorkoutVolume(exercise);
      case 'totalReps':
        return this.calculateTotalReps(exercise);
      default:
        return 0;
    }
  }
}
