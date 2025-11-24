import { Component, input } from '@angular/core';
import { BaseChartComponent, ChartDataPoint } from '../../base-chart/base-chart';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [BaseChartComponent],
  template: `
    <app-base-chart
      [data]="data()"
      [chartType]="'bar'"
    />
  `
})
export class AnalyticsChartComponent {
  data = input.required<ChartDataPoint[]>();
}

export type { ChartDataPoint };
