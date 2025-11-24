import { Component, input, computed, Signal } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart';
import { TimeRangeSelectorComponent } from '../time-range-selector/time-range-selector';
import { MetricSelectorComponent } from '../metric-selector/metric-selector';
import { ChartInfoDisplayComponent } from '../chart-info-display/chart-info-display';
import { 
  TimeRange, 
  MetricOption, 
  ChartSelectionEvent,
  ChartType,
  ChartDataPoint
} from '../../models/analytics.models';
import { ChartStateManager } from '../../utils/chart-state.manager';

/**
 * Generic chart container that handles all chart UI and interactions.
 * Accepts a ChartStateManager and configuration to be fully reusable.
 */
@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [BaseChartComponent, TimeRangeSelectorComponent, MetricSelectorComponent, ChartInfoDisplayComponent],
  template: `
    <div class="jacaona-chart-container">
      <!-- Chart Info & Range Selector -->
      <div class="jacaona-chart-container__header">
        <app-chart-info-display [displayText]="chartInfoText()" />
        <app-time-range-selector
          [selectedRange]="selectedRange()"
          (rangeChange)="onRangeChange($event)"
        />
      </div>

      <!-- Chart -->
      <div class="jacaona-chart-container__chart-wrapper">
        <app-base-chart 
          [data]="chartData()()" 
          [chartType]="chartType()"
          [yAxisLabel]="yAxisLabel()"
          (dataPointSelected)="onDataPointSelected($event)"
        />
      </div>

      <!-- Metric Selector -->
      <app-metric-selector
        [options]="metricOptions()"
        [selectedMetric]="selectedMetric()"
        (metricChange)="onMetricChange($event)"
      />
    </div>
  `,
  styles: [`
    .jacaona-chart-container {
      display: flex;
      flex-direction: column;
      gap: var(--jacaona-space-lg);
    }

    .jacaona-chart-container__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--jacaona-space-md);
      flex-wrap: wrap;
    }

    .jacaona-chart-container__chart-wrapper {
      min-height: 300px;
    }
  `]
})
export class ChartContainerComponent<TMetric = string> {
  // Configuration inputs
  chartState = input.required<ChartStateManager<TMetric>>();
  chartData = input.required<Signal<ChartDataPoint[]>>();
  metricOptions = input.required<MetricOption<TMetric>[]>();
  chartType = input<ChartType>('bar');
  yAxisLabel = input<string>('');

  // Expose chart state as computed signals for template
  chartInfoText = computed(() => this.chartState().chartInfoText());
  selectedRange = computed(() => this.chartState().selectedRange());
  selectedMetric = computed(() => this.chartState().selectedMetric());

  onMetricChange(metric: TMetric): void {
    this.chartState().setMetric(metric);
  }

  onRangeChange(range: TimeRange): void {
    this.chartState().setRange(range);
  }

  onDataPointSelected(event: ChartSelectionEvent): void {
    this.chartState().selectDataPoint(event);
  }
}
