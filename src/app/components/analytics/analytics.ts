import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';
import { TimeRangeSelectorComponent, TimeRange } from '../time-range-selector/time-range-selector';
import { MetricSelectorComponent, MetricOption } from '../metric-selector/metric-selector';
import { ChartInfoDisplayComponent } from '../chart-info-display/chart-info-display';
import { AnalyticsChartComponent, ChartDataPoint } from './analytics-chart/analytics-chart';
import { ChartSelectionEvent } from '../base-chart/base-chart';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set } from '../../models/workout.models';

type MetricType = 'duration' | 'volume' | 'reps';

interface ChartData {
  date: string;
  value: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TopBarComponent, BottomNavComponent, TimeRangeSelectorComponent, MetricSelectorComponent, ChartInfoDisplayComponent, AnalyticsChartComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent {
  private router = inject(Router);

  // State
  selectedMetric = signal<MetricType>('duration');
  selectedRange = signal<TimeRange>('Last 3 months');
  selectedDataPoint = signal<ChartSelectionEvent | null>(null);

  metricOptions: MetricOption<MetricType>[] = [
    { id: 'duration', label: 'Duration' },
    { id: 'volume', label: 'Volume' },
    { id: 'reps', label: 'Reps' }
  ];

  // Computed
  chartData = computed(() => {
    return this.getChartData();
  });

  chartInfoText = computed(() => {
    const selected = this.selectedDataPoint();
    if (selected) {
      return this.formatDataPointInfo(selected);
    }
    return this.getWeekSummary();
  });

  constructor(private workoutService: WorkoutService) {}

  private getChartData(): ChartDataPoint[] {
    const workouts = this.workoutService.workoutsSignal()();
    const metric = this.selectedMetric();
    const range = this.selectedRange();

    // Filter workouts by date range
    const now = new Date();
    const filteredWorkouts = workouts.filter((workout: Workout) => {
      const workoutDate = new Date(workout.date);
      
      if (range === 'Last 3 months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return workoutDate >= threeMonthsAgo;
      } else if (range === 'Year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return workoutDate >= oneYearAgo;
      }
      return true; // All time
    });

    // Group by date and calculate metric
    const dataMap = new Map<string, number>();

    filteredWorkouts.forEach((workout: Workout) => {
      const dateKey = new Date(workout.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      let value = 0;
      if (metric === 'duration') {
        value = workout.duration || 0;
      } else if (metric === 'volume') {
        value = workout.exercises.reduce((sum: number, ex: Exercise) => {
          return sum + ex.sets.reduce((setSum: number, set: Set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
        }, 0);
      } else if (metric === 'reps') {
        value = workout.exercises.reduce((sum: number, ex: Exercise) => {
          return sum + ex.sets.reduce((setSum: number, set: Set) => setSum + (set.reps || 0), 0);
        }, 0);
      }

      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + value);
    });

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 data points
  }

  onMetricChange(metric: MetricType) {
    this.selectedMetric.set(metric);
    this.selectedDataPoint.set(null); // Clear selection when metric changes
  }

  onRangeChange(range: TimeRange) {
    this.selectedRange.set(range);
    this.selectedDataPoint.set(null); // Clear selection when range changes
  }

  onDataPointSelected(event: ChartSelectionEvent) {
    this.selectedDataPoint.set(event);
  }

  private formatDataPointInfo(event: ChartSelectionEvent): string {
    const metric = this.selectedMetric();
    const value = event.value;
    const date = event.date;
    const relativeTime = this.getRelativeTime(date);

    if (metric === 'duration') {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      return `${timeStr} ${relativeTime}`;
    } else if (metric === 'volume') {
      return `${Math.round(value)} kg ${relativeTime}`;
    } else {
      return `${Math.round(value)} reps ${relativeTime}`;
    }
  }

  private getRelativeTime(dateStr: string): string {
    // Parse the date string (format: "Nov 15" or similar)
    const now = new Date();
    const currentYear = now.getFullYear();
    const parsedDate = new Date(`${dateStr}, ${currentYear}`);
    
    // If parsed date is in the future, it's probably from last year
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

  navigateToExercises() {
    this.router.navigate(['/exercises']);
  }

  navigateToCalendar() {
    // TODO: Implement navigation to calendar view
    console.log('Navigate to calendar view');
  }

  private getWeekSummary(): string {
    const workouts = this.workoutService.workoutsSignal()();
    const metric = this.selectedMetric();
    
    // Get workouts from last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const weekWorkouts = workouts.filter((workout: Workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= oneWeekAgo && workout.completed;
    });
    
    let total = 0;
    let unit = '';
    
    if (metric === 'duration') {
      total = weekWorkouts.reduce((sum: number, workout: Workout) => sum + (workout.duration || 0), 0);
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return hours > 0 ? `${hours}h ${minutes}m this week` : `${minutes}m this week`;
    } else if (metric === 'volume') {
      total = weekWorkouts.reduce((sum: number, workout: Workout) => {
        return sum + workout.exercises.reduce((exSum: number, ex: Exercise) => {
          return exSum + ex.sets.reduce((setSum: number, set: Set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
        }, 0);
      }, 0);
      return `${Math.round(total)} kg this week`;
    } else {
      total = weekWorkouts.reduce((sum: number, workout: Workout) => {
        return sum + workout.exercises.reduce((exSum: number, ex: Exercise) => {
          return exSum + ex.sets.reduce((setSum: number, set: Set) => setSum + (set.reps || 0), 0);
        }, 0);
      }, 0);
      return `${total} reps this week`;
    }
  }
}
