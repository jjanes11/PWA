import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricOption } from '../../models/analytics.models';

@Component({
  selector: 'app-metric-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jacaona-metric-selector-wrapper">
      <div class="jacaona-metric-selector">
        @for (option of options(); track option.id) {
          <button
            [class]="'jacaona-metric-btn' + (selectedMetric() === option.id ? ' jacaona-metric-btn--active' : '')"
            (click)="metricChange.emit(option.id)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .jacaona-metric-selector-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 0 calc(-1 * var(--jacaona-space-lg));
      padding: 0 var(--jacaona-space-lg);
    }

    .jacaona-metric-selector {
      display: flex;
      gap: var(--jacaona-space-sm);
      min-width: min-content;
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
}
