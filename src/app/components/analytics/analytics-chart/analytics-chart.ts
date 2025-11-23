import { Component, input, effect, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';

export interface ChartDataPoint {
  date: string;
  value: number;
}

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  template: `
    <div class="jacaona-analytics-chart">
      <div #chartContainer class="jacaona-analytics-chart__container"></div>
    </div>
  `,
  styles: [`
    .jacaona-analytics-chart {
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg);
      padding: var(--jacaona-space-lg);
    }

    .jacaona-analytics-chart__container {
      width: 100%;
      height: 300px;
    }

    @media (max-width: 480px) {
      .jacaona-analytics-chart__container {
        height: 250px;
      }
    }
  `]
})
export class AnalyticsChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  data = input.required<ChartDataPoint[]>();

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Update chart when data changes
    effect(() => {
      const chartData = this.data();
      if (this.chart) {
        this.updateChart(chartData);
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
      this.updateChart(this.data());
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

  private updateChart(data: ChartDataPoint[]) {
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
}
