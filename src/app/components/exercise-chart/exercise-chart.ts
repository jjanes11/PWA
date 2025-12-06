import { Component, input, computed, inject } from '@angular/core';
import { ChartContainerComponent } from '../chart-container/chart-container';
import { DataStoreService } from '../../services/data-store.service';
import { WorkoutAnalyticsService } from '../../services/workout-analytics.service';
import { ExerciseMetricType, MetricOption } from '../../models/analytics.models';
import { ChartStateManager, formatExerciseDataPoint } from '../../utils/chart-state.manager';
import { ExerciseType } from '../../models/workout.models';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-exercise-chart',
  standalone: true,
  imports: [ChartContainerComponent],
  template: `
    <app-chart-container
      [chartState]="chartState"
      [chartData]="chartData"
      [metricOptions]="metricOptions()"
      [chartType]="'line'"
      [yAxisLabel]="yAxisLabel()"
    />
  `
})
export class ExerciseChartComponent {
  private dataStore = inject(DataStoreService);
  private analyticsService = inject(WorkoutAnalyticsService);
  private exerciseService = inject(ExerciseService);

  // Input: exercise name to show data for
  exerciseName = input.required<string>();

  // Get exercise type from the first workout that has this exercise
  private exerciseType = computed(() => {
    const name = this.exerciseName();
    const workouts = this.dataStore.workoutsSignal()();
    
    for (const workout of workouts) {
      const exercise = workout.exercises.find(e => e.name === name);
      if (exercise?.exerciseType) {
        return exercise.exerciseType;
      }
    }
    
    // Fallback: check exercise library
    const libraryExercise = this.exerciseService.allExercises().find(e => e.name === name);
    return libraryExercise?.exerciseType ?? ExerciseType.WeightAndReps;
  });

  // Metric options based on exercise type
  metricOptions = computed(() => {
    const type = this.exerciseType();
    
    // Duration-based exercises (plank, cardio)
    if (type === ExerciseType.Duration || 
        type === ExerciseType.DurationAndWeight ||
        type === ExerciseType.DistanceAndDuration) {
      return [
        { id: 'bestTime' as ExerciseMetricType, label: 'Best Time' },
        { id: 'totalTime' as ExerciseMetricType, label: 'Total Time' }
      ];
    }
    
    // Bodyweight exercises (pull-ups, push-ups)
    if (type === ExerciseType.BodyweightReps) {
      return [
        { id: 'mostReps' as ExerciseMetricType, label: 'Most Reps (Set)' },
        { id: 'totalReps' as ExerciseMetricType, label: 'Total Reps' }
      ];
    }
    
    // Weighted bodyweight exercises (weighted pull-ups)
    if (type === ExerciseType.WeightedBodyweight) {
      return [
        { id: 'heaviest' as ExerciseMetricType, label: 'Heaviest Weight' },
        { id: 'mostReps' as ExerciseMetricType, label: 'Most Reps (Set)' },
        { id: 'totalReps' as ExerciseMetricType, label: 'Total Reps' }
      ];
    }
    
    // Assisted bodyweight exercises (assisted dips, assisted pull-ups)
    if (type === ExerciseType.AssistedBodyweight) {
      return [
        { id: 'lightest' as ExerciseMetricType, label: 'Lightest Assistance' },
        { id: 'mostReps' as ExerciseMetricType, label: 'Most Reps (Set)' },
        { id: 'totalReps' as ExerciseMetricType, label: 'Total Reps' }
      ];
    }
    
    // Weight and reps exercises (bench press, squat, etc.)
    return [
      { id: 'heaviest' as ExerciseMetricType, label: 'Heaviest Weight' },
      { id: 'oneRepMax' as ExerciseMetricType, label: 'One Rep Max' },
      { id: 'bestSetVolume' as ExerciseMetricType, label: 'Best Set Volume' },
      { id: 'workoutVolume' as ExerciseMetricType, label: 'Workout Volume' },
      { id: 'totalReps' as ExerciseMetricType, label: 'Total Reps' }
    ];
  });

  private defaultMetric = computed(() => {
    const type = this.exerciseType();
    
    if (type === ExerciseType.Duration || 
        type === ExerciseType.DurationAndWeight ||
        type === ExerciseType.DistanceAndDuration) {
      return 'bestTime' as ExerciseMetricType;
    }
    
    if (type === ExerciseType.BodyweightReps) {
      return 'mostReps' as ExerciseMetricType;
    }
    
    if (type === ExerciseType.WeightedBodyweight) {
      return 'heaviest' as ExerciseMetricType;
    }
    
    if (type === ExerciseType.AssistedBodyweight) {
      return 'lightest' as ExerciseMetricType;
    }
    
    return 'heaviest' as ExerciseMetricType;
  });

  // Chart state manager - use getter to access computed defaultMetric
  private _chartState?: ChartStateManager<ExerciseMetricType>;
  get chartState(): ChartStateManager<ExerciseMetricType> {
    if (!this._chartState) {
      this._chartState = new ChartStateManager<ExerciseMetricType>({
        defaultMetric: this.defaultMetric(),
        defaultRange: 'Last 3 months',
        formatDataPoint: (event, metric) => formatExerciseDataPoint(event, metric),
        getDefaultInfo: (): string => {
          const data = this.chartData();
          if (data.length > 0) {
            const lastPoint = data[data.length - 1];
            const metric: ExerciseMetricType = this.chartState.selectedMetric();
            return formatExerciseDataPoint({
              date: lastPoint.date,
              value: lastPoint.value,
              dataIndex: data.length - 1
            }, metric);
          }
          return 'No data available';
        }
      });
    }
    return this._chartState;
  }

  chartData = computed(() => {
    const name = this.exerciseName();
    const metric = this.chartState.selectedMetric();
    const range = this.chartState.selectedRange();
    
    if (!name) return [];

    const workouts = this.dataStore.workoutsSignal()();
    return this.analyticsService.calculateExerciseMetrics(workouts, name, metric, range);
  });

  yAxisLabel = computed(() => {
    const metric = this.chartState.selectedMetric();
    const option = this.metricOptions().find(m => m.id === metric);
    return option?.label || '';
  });
}
