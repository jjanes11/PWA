import { Component, input, computed, inject } from '@angular/core';
import { ChartContainerComponent } from '../chart-container/chart-container';
import { DataStoreService } from '../../services/data-store.service';
import { WorkoutAnalyticsService } from '../../services/workout-analytics.service';
import { ExerciseMetricType, MetricOption } from '../../models/analytics.models';
import { ChartStateManager, formatExerciseDataPoint } from '../../utils/chart-state.manager';

@Component({
  selector: 'app-exercise-chart',
  standalone: true,
  imports: [ChartContainerComponent],
  template: `
    <app-chart-container
      [chartState]="chartState"
      [chartData]="chartData"
      [metricOptions]="metricOptions"
      [chartType]="'line'"
      [yAxisLabel]="yAxisLabel()"
    />
  `
})
export class ExerciseChartComponent {
  private dataStore = inject(DataStoreService);
  private analyticsService = inject(WorkoutAnalyticsService);

  // Input: exercise name to show data for
  exerciseName = input.required<string>();

  metricOptions: MetricOption<ExerciseMetricType>[] = [
    { id: 'heaviest', label: 'Heaviest Weight' },
    { id: 'oneRepMax', label: 'One Rep Max' },
    { id: 'bestSetVolume', label: 'Best Set Volume' },
    { id: 'workoutVolume', label: 'Workout Volume' },
    { id: 'totalReps', label: 'Total Reps' }
  ];

  // Chart state manager
  chartState: ChartStateManager<ExerciseMetricType> = new ChartStateManager<ExerciseMetricType>({
    defaultMetric: 'heaviest',
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
    const option = this.metricOptions.find(m => m.id === metric);
    return option?.label || '';
  });
}
