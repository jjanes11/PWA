import { Component, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar';
import { BaseChartComponent, ChartSelectionEvent } from '../base-chart/base-chart';
import { TimeRangeSelectorComponent, TimeRange } from '../time-range-selector/time-range-selector';
import { MetricSelectorComponent, MetricOption } from '../metric-selector/metric-selector';
import { ChartInfoDisplayComponent } from '../chart-info-display/chart-info-display';
import { DataStoreService } from '../../services/data-store.service';
import { Workout, Exercise as WorkoutExercise } from '../../models/workout.models';

type MetricType = 'heaviest' | 'oneRepMax' | 'bestSetVolume' | 'workoutVolume' | 'totalReps';

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

  exerciseName = signal<string>('');
  selectedMetric = signal<MetricType>('heaviest');
  selectedRange = signal<TimeRange>('Last 3 months');
  selectedDataPoint = signal<ChartSelectionEvent | null>(null);

  metricOptions: MetricOption<MetricType>[] = [
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
    const filteredWorkouts = this.filterWorkoutsByRange(workouts, range);
    
    // Create array with workout date and calculated value
    const dataPoints: Array<{ date: Date; value: number }> = [];
    
    for (const workout of filteredWorkouts) {
      const exercise = workout.exercises.find(e => e.name === name);
      if (!exercise) continue;
      
      const value = this.calculateMetric(exercise, metric);
      if (value > 0) { // Only include non-zero values
        dataPoints.push({
          date: new Date(workout.date),
          value
        });
      }
    }
    
    // Sort by date
    dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Format dates for display
    return dataPoints.map(point => ({
      date: point.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      value: Math.round(point.value * 100) / 100 // Round to 2 decimal places
    }));
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

  private filterWorkoutsByRange(workouts: Workout[], range: TimeRange): Workout[] {
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

  private calculateMetric(exercise: WorkoutExercise, metric: MetricType): number {
    const completedSets = exercise.sets.filter(s => s.completed);
    if (completedSets.length === 0) return 0;
    
    switch (metric) {
      case 'heaviest':
        return Math.max(...completedSets.map(s => s.weight));
        
      case 'oneRepMax':
        // Brzycki formula: weight / (1.0278 - 0.0278 * reps)
        return Math.max(...completedSets.map(s => 
          s.weight / (1.0278 - 0.0278 * s.reps)
        ));
        
      case 'bestSetVolume':
        return Math.max(...completedSets.map(s => s.weight * s.reps));
        
      case 'workoutVolume':
        return completedSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
        
      case 'totalReps':
        return completedSets.reduce((sum, s) => sum + s.reps, 0);
        
      default:
        return 0;
    }
  }

  onMetricChange(metric: MetricType): void {
    this.selectedMetric.set(metric);
    this.selectedDataPoint.set(null); // Clear selection when metric changes
  }

  onRangeChange(range: TimeRange): void {
    this.selectedRange.set(range);
    this.selectedDataPoint.set(null); // Clear selection when range changes
  }

  onDataPointSelected(event: ChartSelectionEvent): void {
    this.selectedDataPoint.set(event);
  }

  private formatDataPointInfo(event: ChartSelectionEvent): string {
    const metric = this.selectedMetric();
    const value = event.value;
    const date = event.date;
    const relativeTime = this.getRelativeTime(date);
    const metricLabel = this.metricOptions.find(m => m.id === metric)?.label || '';

    if (metric === 'heaviest' || metric === 'oneRepMax' || metric === 'bestSetVolume') {
      return `${Math.round(value)} kg ${relativeTime}`;
    } else if (metric === 'workoutVolume') {
      return `${Math.round(value)} kg ${relativeTime}`;
    } else {
      return `${Math.round(value)} reps ${relativeTime}`;
    }
  }

  private getRelativeTime(dateStr: string): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const parsedDate = new Date(`${dateStr}, ${currentYear}`);
    
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

  getYAxisLabel(): string {
    return this.yAxisLabel();
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }
}
