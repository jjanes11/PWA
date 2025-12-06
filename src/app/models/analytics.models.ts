export type WorkoutMetricType = 'duration' | 'volume' | 'reps';
export type ExerciseMetricType = 'heaviest' | 'lightest' | 'oneRepMax' | 'bestSetVolume' | 'workoutVolume' | 'totalReps' | 'mostReps' | 'bestTime' | 'totalTime';
export type TimeRange = 'Last 3 months' | 'Year' | 'All time';
export type ChartType = 'bar' | 'line';

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartSelectionEvent {
  date: string;
  value: number;
  dataIndex: number;
}

export interface MetricOption<T = string> {
  id: T;
  label: string;
}

export interface WorkoutMetricConfig {
  id: WorkoutMetricType;
  label: string;
  unit: string;
  formatter: (value: number) => string;
}

export interface ExerciseMetricConfig {
  id: ExerciseMetricType;
  label: string;
  unit: string;
  formatter: (value: number) => string;
}

export interface ChartConfig {
  type: ChartType;
  yAxisLabel: string;
  showDataPointSelection: boolean;
}

export interface TimeRangeConfig {
  id: TimeRange;
  label: string;
  getDateCutoff: (now: Date) => Date | null;
}
