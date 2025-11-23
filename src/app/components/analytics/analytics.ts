import { Component, signal, computed, effect, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { TopBarComponent } from '../top-bar/top-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';
import { BottomMenuComponent, BottomMenuItem } from '../bottom-menu/bottom-menu';
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
  imports: [CommonModule, TopBarComponent, BottomNavComponent, BottomMenuComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

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

  constructor(private workoutService: WorkoutService) {
    // Update chart when metric or range changes
    effect(() => {
      const metric = this.selectedMetric();
      const range = this.selectedRange();
      const data = this.chartData();
      
      if (this.chart) {
        this.updateChart(data);
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initChart() {
    if (this.chartContainer) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
      this.updateChart(this.chartData());
    }
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private updateChart(data: ChartData[]) {
    if (!this.chart) return;

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
        axisLine: {
          lineStyle: {
            color: '#30363d' // --jacaona-border
          }
        },
        axisLabel: {
          color: '#8b949e', // --jacaona-text-secondary
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8b949e', // --jacaona-text-secondary
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#30363d', // --jacaona-border
            type: 'dashed'
          }
        }
      },
      series: [
        {
          data: data.map(d => d.value),
          type: 'bar',
          itemStyle: {
            color: '#3b82f6', // --jacaona-accent-blue
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%'
        }
      ]
    };

    this.chart.setOption(option);
  }

  private getChartData(): ChartData[] {
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
