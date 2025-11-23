import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';
import { BottomMenuComponent, BottomMenuItem } from '../bottom-menu/bottom-menu';
import { AnalyticsChartComponent, ChartDataPoint } from './analytics-chart/analytics-chart';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set } from '../../models/workout.models';

type MetricType = 'duration' | 'volume' | 'reps';
type TimeRange = 'Last 3 months' | 'Year' | 'All time';

interface ChartData {
  date: string;
  value: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TopBarComponent, BottomNavComponent, BottomMenuComponent, AnalyticsChartComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent {

  // State
  selectedMetric = signal<MetricType>('duration');
  selectedRange = signal<TimeRange>('Last 3 months');
  showRangeMenu = signal(false);

  // Computed
  chartData = computed(() => {
    return this.getChartData();
  });

  weekSummary = computed(() => {
    return this.getWeekSummary();
  });

  rangeMenuItems: BottomMenuItem[] = [
    { action: 'Last 3 months', text: 'Last 3 months', icon: '' },
    { action: 'Year', text: 'Year', icon: '' },
    { action: 'All time', text: 'All time', icon: '' }
  ];

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

  selectMetric(metric: MetricType) {
    this.selectedMetric.set(metric);
  }

  toggleRangeMenu() {
    this.showRangeMenu.update(v => !v);
  }

  onRangeMenuAction(itemId: string) {
    this.selectedRange.set(itemId as TimeRange);
    this.showRangeMenu.set(false);
  }

  onRangeMenuClose() {
    this.showRangeMenu.set(false);
  }

  navigateToExercises() {
    // TODO: Implement navigation to exercises history
    console.log('Navigate to exercises history');
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
