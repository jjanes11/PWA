import { Component, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar';
import { BaseChartComponent, ChartSelectionEvent } from '../base-chart/base-chart';
import { TimeRangeSelectorComponent } from '../time-range-selector/time-range-selector';
import { MetricSelectorComponent, MetricOption } from '../metric-selector/metric-selector';
import { ChartInfoDisplayComponent } from '../chart-info-display/chart-info-display';
import { DataStoreService } from '../../services/data-store.service';
import { WorkoutAnalyticsService } from '../../services/workout-analytics.service';
import { ExerciseMetricType } from '../../services/metric-calculator.service';
import { TimeRange } from '../../utils/date.utils';
import { getRelativeTime } from '../../utils/date.utils';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, TopBarComponent, BaseChartComponent, TimeRangeSelectorComponent, MetricSelectorComponent, ChartInfoDisplayComponent],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.css'
})
export class ExerciseDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataStore = inject(DataStoreService);
  private analyticsService = inject(WorkoutAnalyticsService);

  exerciseName = signal<string>('');
  selectedMetric = signal<ExerciseMetricType>('heaviest');
  selectedRange = signal<TimeRange>('Last 3 months');
  selectedDataPoint = signal<ChartSelectionEvent | null>(null);

  metricOptions: MetricOption<ExerciseMetricType>[] = [
    { id: 'heaviest', label: 'Heaviest Weight' },
    { id: 'oneRepMax', label: 'One Rep Max' },
    { id: 'bestSetVolume', label: 'Best Set Volume' },
    { id: 'workoutVolume', label: 'Workout Volume' },
    { id: 'totalReps', label: 'Total Reps' }
  ];

  constructor() {
    // Get exercise name from route
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.exerciseName.set(decodeURIComponent(name));
    }
  }

  chartData = computed(() => {
    const name = this.exerciseName();
    const metric = this.selectedMetric();
    const range = this.selectedRange();
    
    if (!name) return [];

    const workouts = this.dataStore.workoutsSignal()();
    return this.analyticsService.calculateExerciseMetrics(workouts, name, metric, range);
  });

  yAxisLabel = computed(() => {
    const metric = this.selectedMetric();
    const option = this.metricOptions.find(m => m.id === metric);
    return option?.label || '';
  });

  chartInfoText = computed(() => {
    const selected = this.selectedDataPoint();
    if (selected) {
      return this.formatDataPointInfo(selected);
    }
    
    // Show last data point info by default
    const data = this.chartData();
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      return this.formatDataPointInfo({
        date: lastPoint.date,
        value: lastPoint.value,
        dataIndex: data.length - 1
      });
    }
    
    return 'No data available';
  });

  onMetricChange(metric: ExerciseMetricType): void {
    this.selectedMetric.set(metric);
    this.selectedDataPoint.set(null);
  }

  onRangeChange(range: TimeRange): void {
    this.selectedRange.set(range);
    this.selectedDataPoint.set(null);
  }

  onDataPointSelected(event: ChartSelectionEvent): void {
    this.selectedDataPoint.set(event);
  }

  private formatDataPointInfo(event: ChartSelectionEvent): string {
    const metric = this.selectedMetric();
    const relativeTime = getRelativeTime(event.date);
    
    // All exercise metrics are weight-based except totalReps
    const metricType = metric === 'totalReps' ? 'reps' : 'weight';
    
    if (metricType === 'weight') {
      return `${Math.round(event.value)} kg ${relativeTime}`;
    } else {
      return `${Math.round(event.value)} reps ${relativeTime}`;
    }
  }

  getYAxisLabel(): string {
    return this.yAxisLabel();
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }
}
