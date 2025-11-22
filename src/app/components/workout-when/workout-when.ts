import { Component, input } from '@angular/core';

@Component({
  selector: 'app-workout-when',
  standalone: true,
  template: `
    <div class="jacaona-when-section">
      <div class="jacaona-section-title">When</div>
      <div class="jacaona-when-value">{{ dateTime() }}</div>
    </div>
  `,
  styles: [`
    .jacaona-when-section {
      margin-bottom: var(--jacaona-space-lg);
    }

    .jacaona-section-title {
      color: var(--jacaona-text-muted);
      font-size: 12px;
      font-weight: var(--jacaona-font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--jacaona-space-sm);
    }

    .jacaona-when-value {
      color: var(--jacaona-accent-blue);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-medium);
    }
  `]
})
export class WorkoutWhenComponent {
  dateTime = input.required<string>();
}
