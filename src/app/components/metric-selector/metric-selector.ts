import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricOption, ExerciseMetricType } from '../../models/analytics.models';
import { MetricInfoTooltipComponent } from '../metric-info-tooltip/metric-info-tooltip';
import { getMetricDescription } from '../../utils/metric-descriptions';

@Component({
  selector: 'app-metric-selector',
  standalone: true,
  imports: [CommonModule, MetricInfoTooltipComponent],
  template: `
    <div class="jacaona-metric-selector-wrapper">
      <div class="jacaona-metric-selector">
        @for (option of options(); track option.id) {
          <div class="jacaona-metric-btn-container">
            <button
              [class]="'jacaona-metric-btn' + (selectedMetric() === option.id ? ' jacaona-metric-btn--active' : '')"
              (click)="metricChange.emit(option.id)"
            >
              {{ option.label }}
            </button>
            @if (showTooltips()) {
              <app-metric-info-tooltip
                [metricLabel]="option.label"
                [metricDescription]="getDescription(option.id)"
                [id]="'metric-' + option.id"
              />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .jacaona-metric-selector-wrapper {
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      margin: 0 calc(-1 * var(--jacaona-space-lg));
      padding: 0 var(--jacaona-space-lg);
      padding-top: 120px;
      margin-top: -120px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .jacaona-metric-selector-wrapper::-webkit-scrollbar {
      display: none;
    }

    .jacaona-metric-selector {
      display: flex;
      gap: var(--jacaona-space-sm);
      min-width: min-content;
    }
    
    .jacaona-metric-btn-container {
      position: relative;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      z-index: 1;
    }

    .jacaona-metric-btn {
      flex-shrink: 0;
      padding: var(--jacaona-space-md) var(--jacaona-space-lg);
      background: var(--jacaona-bg-secondary);
      border: none;
      border-radius: var(--jacaona-radius-full);
      color: var(--jacaona-text-secondary);
      font-size: var(--jacaona-font-size-sm);
      font-weight: var(--jacaona-font-weight-medium);
      cursor: pointer;
      transition: all var(--jacaona-transition-fast);
      font-family: var(--jacaona-font-primary);
      white-space: nowrap;
    }

    .jacaona-metric-btn:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-metric-btn--active {
      background: var(--jacaona-accent-blue);
      color: white;
    }

    .jacaona-metric-btn--active:hover {
      background: var(--jacaona-accent-blue-hover);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .jacaona-metric-selector-wrapper {
        margin: 0 calc(-1 * var(--jacaona-space-md));
        padding: 0 var(--jacaona-space-md);
      }
    }
  `]
})
export class MetricSelectorComponent<T = string> {
  options = input.required<MetricOption<T>[]>();
  selectedMetric = input.required<T>();
  metricChange = output<T>();
  
  // Show tooltips only for exercise metrics (not for other chart types)
  showTooltips = computed(() => {
    const firstOption = this.options()[0];
    if (!firstOption) return false;
    
    // Check if metric is an ExerciseMetricType by seeing if we have a description for it
    return typeof firstOption.id === 'string' && this.getDescription(firstOption.id) !== '';
  });
  
  getDescription(metricId: T): string {
    // Only provide descriptions for ExerciseMetricType
    if (typeof metricId === 'string') {
      return getMetricDescription(metricId as ExerciseMetricType);
    }
    return '';
  }
}
