import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';
import { TimeRangeSelectorComponent } from '../time-range-selector/time-range-selector';
import { MetricSelectorComponent, MetricOption } from '../metric-selector/metric-selector';
import { ChartInfoDisplayComponent } from '../chart-info-display/chart-info-display';
import { AnalyticsChartComponent } from './analytics-chart/analytics-chart';
import { ChartSelectionEvent } from '../base-chart/base-chart';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutAnalyticsService } from '../../services/workout-analytics.service';
import { WorkoutMetricType } from '../../services/metric-calculator.service';
import { TimeRange } from '../../utils/date.utils';
import { getRelativeTime } from '../../utils/date.utils';
import { formatMetricWithTime } from '../../utils/metric-formatter.utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TopBarComponent, BottomNavComponent, TimeRangeSelectorComponent, MetricSelectorComponent, ChartInfoDisplayComponent, AnalyticsChartComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private analyticsService = inject(WorkoutAnalyticsService);

  // State
  selectedMetric = signal<WorkoutMetricType>('duration');
  selectedRange = signal<TimeRange>('Last 3 months');
  selectedDataPoint = signal<ChartSelectionEvent | null>(null);

  metricOptions: MetricOption<WorkoutMetricType>[] = [
    { id: 'duration', label: 'Duration' },
    { id: 'volume', label: 'Volume' },
    { id: 'reps', label: 'Reps' }
  ];

  // Computed
  chartData = computed(() => {
    const workouts = this.workoutService.workoutsSignal()();
    const metric = this.selectedMetric();
    const range = this.selectedRange();
    return this.analyticsService.calculateWorkoutMetrics(workouts, metric, range);
  });

  chartInfoText = computed(() => {
    const selected = this.selectedDataPoint();
    if (selected) {
      return this.formatDataPointInfo(selected);
    }
    const workouts = this.workoutService.workoutsSignal()();
    const metric = this.selectedMetric();
    return this.analyticsService.getWeekSummary(workouts, metric);
  });

  onMetricChange(metric: WorkoutMetricType) {
    this.selectedMetric.set(metric);
    this.selectedDataPoint.set(null);
  }

  onRangeChange(range: TimeRange) {
    this.selectedRange.set(range);
    this.selectedDataPoint.set(null);
  }

  onDataPointSelected(event: ChartSelectionEvent) {
    this.selectedDataPoint.set(event);
  }

  private formatDataPointInfo(event: ChartSelectionEvent): string {
    const metric = this.selectedMetric();
    const relativeTime = getRelativeTime(event.date);
    return formatMetricWithTime(event.value, metric, relativeTime);
  }

  navigateToExercises() {
    this.router.navigate(['/exercises']);
  }

  navigateToCalendar() {
    console.log('Navigate to calendar view');
  }
}
