import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataStoreService } from '../../services/data-store.service';
import { Workout } from '../../models/workout.models';

interface CalendarDay {
  date: number;
  dateStr: string; // YYYY-MM-DD format
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  isCurrentMonth: boolean;
  hasWorkout: boolean;
}

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jacaona-calendar-month">
      <h2 class="jacaona-calendar-month__title">{{ monthTitle() }}</h2>
      
      <div class="jacaona-calendar-month__days">
        @for (day of days(); track day.dateStr) {
          <button 
            class="jacaona-calendar-month__day"
            [class.jacaona-calendar-month__day--placeholder]="!day.isCurrentMonth"
            [class.jacaona-calendar-month__day--has-workout]="day.hasWorkout"
            [style.grid-column-start]="$index === 0 ? day.dayOfWeek + 1 : 'auto'"
            [disabled]="!day.isCurrentMonth"
            (click)="onDayClick(day)"
          >
            @if (day.isCurrentMonth) {
              <span class="jacaona-calendar-month__day-number">{{ day.date }}</span>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .jacaona-calendar-month {
      width: 100%;
      background: var(--jacaona-bg-primary);
      /* Fixed height to fit exactly 2 months in viewport */
      /* calc((100vh - top-bar - bottom-nav - days-header) / 2) */
      height: calc((100vh - 56px - 60px - 40px) / 2);
      display: flex;
      flex-direction: column;
    }

    .jacaona-calendar-month__title {
      color: var(--jacaona-text-primary);
      font-size: var(--jacaona-font-size-lg);
      font-weight: var(--jacaona-font-weight-semibold);
      margin: 0;
      padding: var(--jacaona-space-lg) var(--jacaona-space-md);
      flex-shrink: 0;
    }

    .jacaona-calendar-month__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--jacaona-border);
      border-top: 1px solid var(--jacaona-border);
      flex: 1;
      align-content: start;
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
      border: none;
      border-bottom: 1px solid var(--jacaona-border);
      cursor: pointer;
      transition: var(--jacaona-transition-fast);
      width: 100%;
    }

    .jacaona-calendar-month__day:hover:not(:disabled):not(.jacaona-calendar-month__day--placeholder) {
      background: rgba(255, 255, 255, 0.05);
    }

    .jacaona-calendar-month__day--placeholder {
      visibility: hidden;
      cursor: default;
    }

    .jacaona-calendar-month__day--has-workout .jacaona-calendar-month__day-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--jacaona-accent-blue);
    }
  `]
})
export class CalendarMonthComponent {
  private router = inject(Router);
  private dataStore = inject(DataStoreService);

  year = input.required<number>();
  month = input.required<number>(); // 0-11 (JavaScript month)

  monthTitle = computed(() => {
    const date = new Date(this.year(), this.month(), 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  days = computed(() => {
    const year = this.year();
    const month = this.month();
    const workouts = this.dataStore.workoutsSignal()();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, convert to 0 = Monday)
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Sunday becomes 6

    // Create a set of dates with workouts for fast lookup
    const workoutDates = new Set(
      workouts
        .filter(w => w.completed)
        .map(w => {
          const date = new Date(w.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        })
    );

    const calendarDays: CalendarDay[] = [];

    // Add days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayDate = new Date(year, month, date);
      let dayOfWeek = dayDate.getDay() - 1;
      if (dayOfWeek === -1) dayOfWeek = 6; // Sunday becomes 6

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

      calendarDays.push({
        date,
        dateStr,
        dayOfWeek,
        isCurrentMonth: true,
        hasWorkout: workoutDates.has(dateStr)
      });
    }

    return calendarDays;
  });

  onDayClick(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.router.navigate(['/calendar-day', day.dateStr]);
    }
  }
}
