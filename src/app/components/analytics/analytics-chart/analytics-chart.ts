import { Component, computed, inject } from '@angular/core';
import { ChartContainerComponent } from '../../chart-container/chart-container';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutAnalyticsService } from '../../../services/workout-analytics.service';
import { WorkoutMetricType, MetricOption } from '../../../models/analytics.models';
import { ChartStateManager, formatWorkoutDataPoint } from '../../../utils/chart-state.manager';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [ChartContainerComponent],
  template: `
    <app-chart-container
      [chartState]="chartState"
      [chartData]="chartData"
      [metricOptions]="metricOptions"
      [chartType]="'bar'"
    />
  `
})
export class AnalyticsChartComponent {
  private workoutService = inject(WorkoutService);
  private analyticsService = inject(WorkoutAnalyticsService);

  metricOptions: MetricOption<WorkoutMetricType>[] = [
    { id: 'duration', label: 'Duration' },
    { id: 'volume', label: 'Volume' },
    { id: 'reps', label: 'Reps' }
  ];

  // Chart state manager
  chartState: ChartStateManager<WorkoutMetricType> = new ChartStateManager<WorkoutMetricType>({
    defaultMetric: 'duration',
    defaultRange: 'Last 3 months',
    formatDataPoint: (event, metric) => formatWorkoutDataPoint(event, metric),
    getDefaultInfo: (): string => {
      const workouts = this.workoutService.workoutsSignal()();
      const metric: WorkoutMetricType = this.chartState.selectedMetric();
      return this.analyticsService.getWeekSummary(workouts, metric);
    }
  });

  // Computed chart data
  chartData = computed(() => {
    const workouts = this.workoutService.workoutsSignal()();
    const metric = this.chartState.selectedMetric();
    const range = this.chartState.selectedRange();
    return this.analyticsService.calculateWorkoutMetrics(workouts, metric, range);
  });
}
