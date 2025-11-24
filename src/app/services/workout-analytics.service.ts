import { Injectable, inject } from '@angular/core';
import { Workout } from '../models/workout.models';
import { MetricCalculatorService } from './metric-calculator.service';
import { 
  WorkoutMetricType, 
  ExerciseMetricType, 
  TimeRange, 
  ChartDataPoint 
} from '../models/analytics.models';
import { filterWorkoutsByRange, formatChartDate, getLastWeekWorkouts } from '../utils/date.utils';
import { formatDuration, formatWeight, formatReps } from '../utils/metric-formatter.utils';

@Injectable({
  providedIn: 'root'
})
export class WorkoutAnalyticsService {
  private metricCalculator = inject(MetricCalculatorService);
  
  /**
   * Aggregates workout data into chart data points for a given metric and time range.
   */
  calculateWorkoutMetrics(
    workouts: Workout[], 
    metric: WorkoutMetricType, 
    range: TimeRange
  ): ChartDataPoint[] {
    const filteredWorkouts = filterWorkoutsByRange(workouts, range);
    
    // Group by date and calculate metric
    const dataMap = new Map<string, number>();
    
    filteredWorkouts.forEach(workout => {
      const dateKey = formatChartDate(new Date(workout.date));
      const value = this.metricCalculator.calculateWorkoutMetric(workout, metric);
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + value);
    });
    
    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 data points
  }
  
  /**
   * Calculates metrics for a specific exercise across workouts.
   */
  calculateExerciseMetrics(
    workouts: Workout[],
    exerciseName: string,
    metric: ExerciseMetricType,
    range: TimeRange
  ): ChartDataPoint[] {
    const filteredWorkouts = filterWorkoutsByRange(workouts, range);
    
    // Create array with workout date and calculated value
    const dataPoints: Array<{ date: Date; value: number }> = [];
    
    for (const workout of filteredWorkouts) {
      const exercise = workout.exercises.find(e => e.name === exerciseName);
      if (!exercise) continue;
      
      const value = this.metricCalculator.calculateExerciseMetric(exercise, metric);
      if (value > 0) {
        dataPoints.push({
          date: new Date(workout.date),
          value
        });
      }
    }
    
    // Sort by date and format
    dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return dataPoints.map(point => ({
      date: formatChartDate(point.date),
      value: Math.round(point.value * 100) / 100 // Round to 2 decimal places
    }));
  }
  
  /**
   * Gets summary of last week's workouts for a given metric.
   */
  getWeekSummary(workouts: Workout[], metric: WorkoutMetricType): string {
    const weekWorkouts = getLastWeekWorkouts(workouts);
    
    const total = weekWorkouts.reduce((sum, workout) => {
      return sum + this.metricCalculator.calculateWorkoutMetric(workout, metric);
    }, 0);
    
    switch (metric) {
      case 'duration':
        return `${formatDuration(total)} this week`;
      case 'volume':
        return `${formatWeight(total)} this week`;
      case 'reps':
        return `${formatReps(total)} this week`;
      default:
        return `${total} this week`;
    }
  }
}
