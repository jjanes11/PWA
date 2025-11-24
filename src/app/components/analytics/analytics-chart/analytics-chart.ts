import { Component, input, output } from '@angular/core';
import { BaseChartComponent, ChartDataPoint, ChartSelectionEvent } from '../../base-chart/base-chart';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [BaseChartComponent],
  template: `
    <app-base-chart
      [data]="data()"
      [chartType]="'bar'"
      (dataPointSelected)="dataPointSelected.emit($event)"
    />
  `
})
export class AnalyticsChartComponent {
  data = input.required<ChartDataPoint[]>();
  dataPointSelected = output<ChartSelectionEvent>();
}

export type { ChartDataPoint };
