import { Component, input } from '@angular/core';

/**
 * Atomic component: Displays weekday names header
 * Single responsibility: Render weekday names in calendar
 * Reusable across any calendar view
 */
@Component({
  selector: 'app-calendar-weekdays',
  standalone: true,
  template: `
    <div class="jacaona-calendar-weekdays">
      @for (day of weekdays(); track day) {
        <div class="jacaona-calendar-weekdays__day">{{ day }}</div>
      }
    </div>
  `,
  styles: [`
    .jacaona-calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--jacaona-bg-secondary);
      border-top: 1px solid var(--jacaona-border);
      border-bottom: 1px solid var(--jacaona-border);
      padding: var(--jacaona-space-sm) 0;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .jacaona-calendar-weekdays {
        padding: var(--jacaona-space-xs) 0;
      }
    }

    .jacaona-calendar-weekdays__day {
      color: var(--jacaona-text-primary);
      text-align: center;
      font-size: var(--jacaona-font-size-sm);
      font-weight: var(--jacaona-font-weight-medium);
    }

    @media (max-width: 768px) {
      .jacaona-calendar-weekdays__day {
        font-size: var(--jacaona-font-size-xs);
      }
    }
  `]
})
export class CalendarWeekdaysComponent {
  /**
   * Weekday names to display
   * Default: Mon-Sun
   */
  weekdays = input<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
}
