import { Component, input, output, effect, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';
import { ChartDataPoint, ChartType, ChartSelectionEvent } from '../../models/analytics.models';

@Component({
  selector: 'app-base-chart',
  standalone: true,
  template: `
    <div class="jacaona-chart">
      <div #chartContainer class="jacaona-chart__container"></div>
    </div>
  `,
  styles: [`
    .jacaona-chart {
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg);
      padding: var(--jacaona-space-lg);
    }

    .jacaona-chart__container {
      width: 100%;
      height: 300px;
    }

    @media (max-width: 480px) {
      .jacaona-chart__container {
        height: 250px;
      }
    }
  `]
})
export class BaseChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  data = input.required<ChartDataPoint[]>();
  chartType = input<ChartType>('bar');
  yAxisLabel = input<string>('');
  
  dataPointSelected = output<ChartSelectionEvent>();

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: any = null;

  constructor() {
    // Update chart when data or type changes
    effect(() => {
      const chartData = this.data();
      const type = this.chartType();
      if (this.chart) {
        this.updateChart(chartData, type);
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
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
      this.updateChart(this.data(), this.chartType());
      this.setupClickHandler();
    }
  }

  private setupClickHandler() {
    if (!this.chart) return;
    
    this.chart.on('click', (params: any) => {
      if (params.componentType === 'series') {
        const dataPoint = this.data()[params.dataIndex];
        if (dataPoint) {
          this.dataPointSelected.emit({
            date: dataPoint.date,
            value: dataPoint.value,
            dataIndex: params.dataIndex
          });
        }
      }
    });
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      // Debounce resize to avoid ResizeObserver loop errors
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        if (this.chart) {
          requestAnimationFrame(() => {
            this.chart?.resize();
          });
        }
      }, 100);
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private updateChart(data: ChartDataPoint[], type: ChartType) {
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
            color: '#30363d' // --jacaona-bg-quaternary
          }
        },
        axisLabel: {
          color: '#8b949e', // --jacaona-text-secondary
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: this.yAxisLabel(),
        nameTextStyle: {
          color: '#8b949e', // --jacaona-text-secondary
          fontSize: 12
        },
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
            color: '#30363d', // --jacaona-bg-quaternary
            type: 'dashed'
          }
        }
      },
      series: [
        {
          data: data.map(d => d.value),
          type: type,
          ...(type === 'bar' ? {
            itemStyle: {
              color: '#3b82f6', // --jacaona-accent-blue
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '60%'
          } : {
            lineStyle: {
              color: '#3b82f6', // --jacaona-accent-blue
              width: 3
            },
            itemStyle: {
              color: '#3b82f6' // --jacaona-accent-blue
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          })
        }
      ]
    };

    this.chart.setOption(option);
  }
}
