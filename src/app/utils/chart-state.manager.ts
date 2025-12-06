import { signal, computed, Signal } from '@angular/core';
import { ChartSelectionEvent, TimeRange } from '../models/analytics.models';
import { getRelativeTime } from '../utils/date.utils';
import { formatMetricWithTime } from '../utils/metric-formatter.utils';

export interface ChartStateConfig<T> {
  defaultMetric: T;
  defaultRange: TimeRange;
  formatDataPoint: (event: ChartSelectionEvent, metric: T) => string;
  getDefaultInfo: () => string;
}

/**
 * Manages chart state including metric selection, time range, and data point selection.
 * Provides computed info text based on current selection state.
 */
export class ChartStateManager<TMetric> {
  selectedMetric: Signal<TMetric>;
  selectedRange: Signal<TimeRange>;
  selectedDataPoint: Signal<ChartSelectionEvent | null>;
  
  chartInfoText: Signal<string>;
  
  private _selectedMetric!: ReturnType<typeof signal<TMetric>>;
  private _selectedRange!: ReturnType<typeof signal<TimeRange>>;
  private _selectedDataPoint!: ReturnType<typeof signal<ChartSelectionEvent | null>>;
  
  constructor(private config: ChartStateConfig<TMetric>) {
    this._selectedMetric = signal<TMetric>(config.defaultMetric);
    this._selectedRange = signal<TimeRange>(config.defaultRange);
    this._selectedDataPoint = signal<ChartSelectionEvent | null>(null);
    
    this.selectedMetric = this._selectedMetric.asReadonly();
    this.selectedRange = this._selectedRange.asReadonly();
    this.selectedDataPoint = this._selectedDataPoint.asReadonly();
    
    this.chartInfoText = computed(() => {
      const selected = this._selectedDataPoint();
      if (selected) {
        return this.config.formatDataPoint(selected, this._selectedMetric());
      }
      return this.config.getDefaultInfo();
    });
  }
  
  /**
   * Update selected metric and clear data point selection.
   */
  setMetric(metric: TMetric): void {
    this._selectedMetric.set(metric);
    this.clearSelection();
  }
  
  /**
   * Update selected time range and clear data point selection.
   */
  setRange(range: TimeRange): void {
    this._selectedRange.set(range);
    this.clearSelection();
  }
  
  /**
   * Set selected data point from chart interaction.
   */
  selectDataPoint(event: ChartSelectionEvent): void {
    this._selectedDataPoint.set(event);
  }
  
  /**
   * Clear data point selection.
   */
  clearSelection(): void {
    this._selectedDataPoint.set(null);
  }
  
  /**
   * Reset all state to defaults.
   */
  reset(): void {
    this._selectedMetric.set(this.config.defaultMetric);
    this._selectedRange.set(this.config.defaultRange);
    this._selectedDataPoint.set(null);
  }
}

/**
 * Helper function to format workout metric data points.
 */
export function formatWorkoutDataPoint(
  event: ChartSelectionEvent,
  metric: 'duration' | 'volume' | 'reps'
): string {
  const relativeTime = getRelativeTime(event.date);
  return formatMetricWithTime(event.value, metric, relativeTime);
}

/**
 * Helper function to format exercise metric data points.
 */
export function formatExerciseDataPoint(
  event: ChartSelectionEvent,
  metric: 'heaviest' | 'lightest' | 'oneRepMax' | 'bestSetVolume' | 'workoutVolume' | 'totalReps' | 'mostReps' | 'bestTime' | 'totalTime' | 'longestDistance' | 'totalDistance' | 'distanceVolume'
): string {
  const relativeTime = getRelativeTime(event.date);
  
  // Time-based metrics (duration in seconds)
  if (metric === 'bestTime' || metric === 'totalTime') {
    const minutes = Math.floor(event.value / 60);
    const seconds = Math.round(event.value % 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ${relativeTime}`;
    }
    return `${seconds}s ${relativeTime}`;
  }
  
  // Distance-based metrics (meters)
  if (metric === 'longestDistance' || metric === 'totalDistance') {
    return `${Math.round(event.value)} m ${relativeTime}`;
  }
  
  // Distance volume (kg·m)
  if (metric === 'distanceVolume') {
    return `${Math.round(event.value)} kg·m ${relativeTime}`;
  }
  
  // Rep-based metrics
  if (metric === 'totalReps' || metric === 'mostReps') {
    return `${Math.round(event.value)} reps ${relativeTime}`;
  }
  
  // Weight-based metrics (kg) - includes both heaviest and lightest
  return `${Math.round(event.value)} kg ${relativeTime}`;
}
