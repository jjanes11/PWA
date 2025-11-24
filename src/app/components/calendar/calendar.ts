import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { CalendarMonthComponent } from '../calendar-month/calendar-month';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [TopBarComponent, CalendarMonthComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {
  private router = inject(Router);

  // Get current and previous month
  currentDate = new Date();
  
  currentMonth = computed(() => this.currentDate.getMonth());
  currentYear = computed(() => this.currentDate.getFullYear());
  
  previousMonth = computed(() => {
    const month = this.currentMonth();
    return month === 0 ? 11 : month - 1;
  });
  
  previousYear = computed(() => {
    const month = this.currentMonth();
    const year = this.currentYear();
    return month === 0 ? year - 1 : year;
  });

  goBack(): void {
    this.router.navigate(['/analytics']);
  }
}
