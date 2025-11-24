import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: number;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jacaona-calendar-month">
      <h2 class="jacaona-calendar-month__title">{{ monthTitle() }}</h2>
      
      <div class="jacaona-calendar-month__days">
        @for (day of days(); track day.date + '-' + day.dayOfWeek) {
          <div 
            class="jacaona-calendar-month__day"
            [class.jacaona-calendar-month__day--placeholder]="!day.isCurrentMonth"
            [style.grid-column-start]="$index === 0 ? day.dayOfWeek + 1 : 'auto'"
          >
            @if (day.isCurrentMonth) {
              {{ day.date }}
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .jacaona-calendar-month {
      width: 100%;
      background: var(--jacaona-bg-primary);
    }

    .jacaona-calendar-month__title {
      color: var(--jacaona-text-primary);
      font-size: var(--jacaona-font-size-lg);
      font-weight: var(--jacaona-font-weight-semibold);
      margin: 0;
      padding: var(--jacaona-space-lg) var(--jacaona-space-md);
    }

    .jacaona-calendar-month__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--jacaona-border);
      border-top: 1px solid var(--jacaona-border);
    }

    .jacaona-calendar-month__day {
      background: var(--jacaona-bg-primary);
      color: var(--jacaona-text-primary);
      padding: var(--jacaona-space-md);
      text-align: center;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--jacaona-font-size-base);
    }

    .jacaona-calendar-month__day--placeholder {
      visibility: hidden;
    }
  `]
})
export class CalendarMonthComponent {
  year = input.required<number>();
  month = input.required<number>(); // 0-11 (JavaScript month)

  monthTitle = computed(() => {
    const date = new Date(this.year(), this.month(), 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  days = computed(() => {
    const year = this.year();
    const month = this.month();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, convert to 0 = Monday)
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Sunday becomes 6

    const calendarDays: CalendarDay[] = [];

    // Add days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayDate = new Date(year, month, date);
      let dayOfWeek = dayDate.getDay() - 1;
      if (dayOfWeek === -1) dayOfWeek = 6; // Sunday becomes 6

      calendarDays.push({
        date,
        dayOfWeek,
        isCurrentMonth: true
      });
    }

    return calendarDays;
  });
}
