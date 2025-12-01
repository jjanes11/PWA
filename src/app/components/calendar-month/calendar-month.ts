import { Component, input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '../../services/data-store.service';
import { convertDayOfWeekToMondayFirst, formatDateYMD } from '../../utils/calendar.utils';

interface CalendarDay {
  date: number;
  dateStr: string;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  hasWorkout: boolean;
}

/**
 * Organism component: Display a single month in the calendar
 * Single responsibility: Render month title and grid of days
 */
@Component({
  selector: 'app-calendar-month',
  standalone: true,
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
            [attr.aria-label]="day.isCurrentMonth ? 'Day ' + day.date : null"
          >
            @if (day.isCurrentMonth) {
              <span class="jacaona-calendar-month__day-number">{{ day.date }}</span>
            }
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './calendar-month.css'
})
export class CalendarMonthComponent {
  private router = inject(Router);
  private dataStore = inject(DataStoreService);

  year = input.required<number>();
  month = input.required<number>();

  monthTitle = computed(() => {
    const date = new Date(this.year(), this.month(), 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  days = computed(() => this.generateCalendarDays());

  /**
   * Generate calendar days for the month
   */
  private generateCalendarDays(): CalendarDay[] {
    const year = this.year();
    const month = this.month();
    const workouts = this.dataStore.workoutsSignal()();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    const workoutDates = this.getWorkoutDatesSet(workouts);

    return this.buildDaysList(year, month, daysInMonth, firstDayOfWeek, workoutDates);
  }

  /**
   * Get first day of week (Monday-first, 0-6)
   */
  private getFirstDayOfWeek(year: number, month: number): number {
    const firstDay = new Date(year, month, 1);
    return convertDayOfWeekToMondayFirst(firstDay.getDay());
  }

  /**
   * Create a set of dates with workouts for fast lookup
   */
  private getWorkoutDatesSet(workouts: any[]): Set<string> {
    return new Set(
      workouts
        .filter(w => w.completed)
        .map(w => {
          const date = new Date(w.date);
          return formatDateYMD(date.getFullYear(), date.getMonth(), date.getDate());
        })
    );
  }

  /**
   * Build the array of calendar days
   */
  private buildDaysList(
    year: number,
    month: number,
    daysInMonth: number,
    firstDayOfWeek: number,
    workoutDates: Set<string>
  ): CalendarDay[] {
    const days: CalendarDay[] = [];

    for (let date = 1; date <= daysInMonth; date++) {
      const dayDate = new Date(year, month, date);
      const dayOfWeek = convertDayOfWeekToMondayFirst(dayDate.getDay());
      const dateStr = formatDateYMD(year, month, date);

      days.push({
        date,
        dateStr,
        dayOfWeek,
        isCurrentMonth: true,
        hasWorkout: workoutDates.has(dateStr)
      });
    }

    return days;
  }

  /**
   * Handle day click - navigate to day view
   */
  onDayClick(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.router.navigate(['/calendar-day', day.dateStr]);
    }
  }
}
