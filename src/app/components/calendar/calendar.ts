import { Component, inject, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
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

  // Generate 5 months: 2 before current, current, 2 after current
  months = computed(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const months: { year: number; month: number; id: string }[] = [];
    
    // Generate months from -2 to +2
    for (let offset = -2; offset <= 2; offset++) {
      const date = new Date(currentYear, currentMonth + offset, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        id: `month-${offset}` // ID for scroll target
      });
    }
    
    return months;
  });

  goBack(): void {
    this.router.navigate(['/analytics']);
  }
  
  ngAfterViewInit(): void {
    // Scroll to show previous month at top (index 1, since 0 is 2 months ago)
    setTimeout(() => {
      const previousMonthElement = document.getElementById('month--1');
      if (previousMonthElement) {
        previousMonthElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 100);
  }
}
