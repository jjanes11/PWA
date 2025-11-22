import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardColor = 'blue' | 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  template: `
    <div class="jacaona-card jacaona-stat-card">
      <div class="jacaona-stat-icon" [ngClass]="'jacaona-stat-' + color()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path [attr.d]="iconPath()"/>
        </svg>
      </div>
      <div class="jacaona-stat-content">
        <div class="jacaona-stat-number">
          {{ value() }}
          @if (unit()) {
            <span class="jacaona-stat-unit">{{ unit() }}</span>
          }
        </div>
        <div class="jacaona-stat-label">{{ label() }}</div>
      </div>
    </div>
  `,
  styles: [`
    /* NOTE: Base .jacaona-stat-card styles in src/styles/components.css */
    /* This overrides for component-specific layout */
    .jacaona-stat-card {
      display: flex;
      align-items: center;
      gap: var(--jacaona-space-md);
    }

    .jacaona-stat-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--jacaona-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .jacaona-stat-blue {
      background: rgba(88, 166, 255, 0.1);
      color: var(--jacaona-accent-blue);
    }

    .jacaona-stat-green {
      background: rgba(63, 185, 80, 0.1);
      color: var(--jacaona-success);
    }

    .jacaona-stat-yellow {
      background: rgba(210, 153, 34, 0.1);
      color: var(--jacaona-warning);
    }

    .jacaona-stat-red {
      background: rgba(248, 81, 73, 0.1);
      color: var(--jacaona-danger);
    }

    .jacaona-stat-content {
      flex: 1;
    }

    .jacaona-stat-number {
      font-size: 20px;
      font-weight: var(--jacaona-font-weight-bold);
      color: var(--jacaona-text-primary);
      line-height: 1;
    }

    .jacaona-stat-unit {
      font-size: 14px;
      font-weight: var(--jacaona-font-weight-medium);
      color: var(--jacaona-text-secondary);
    }

    .jacaona-stat-label {
      font-size: 12px;
      color: var(--jacaona-text-secondary);
      margin-top: var(--jacaona-space-xs);
    }
  `]
})
export class StatCardComponent {
  value = input.required<number | string>();
  label = input.required<string>();
  unit = input<string>('');
  color = input<StatCardColor>('blue');
  iconPath = input.required<string>();
}
