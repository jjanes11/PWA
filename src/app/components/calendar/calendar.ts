import { Component, inject, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { CalendarMonthComponent } from '../calendar-month/calendar-month';
import { DialogService } from '../../services/dialog.service';
import { DatePickerDialogComponent } from '../date-picker-dialog/date-picker-dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [TopBarComponent, CalendarMonthComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {
  private router = inject(Router);
  private dialogService = inject(DialogService);

  // Generate 5 months: 2 before current, current, 2 after current
  private monthsSignal = signal<{ year: number; month: number; id: string }[]>([]);
  
  months = computed(() => this.monthsSignal());
  
  constructor() {
    // Initialize with 5 months
    this.loadInitialMonths();
  }
  
  private loadInitialMonths(): void {
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
    
    this.monthsSignal.set(months);
  }

  goBack(): void {
    this.router.navigate(['/analytics']);
  }
  
  openDatePicker(): void {
    this.dialogService
      .open(DatePickerDialogComponent, {})
      .afterClosed()
      .subscribe(date => {
        if (date) {
          this.jumpToDate(date);
        }
      });
  }
  
  private jumpToDate(date: Date): void {
    // Ensure the month exists in calendar
    this.ensureMonthExists(date);
    
    // Navigate to day view
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    this.router.navigate(['/calendar-day', dateStr]);
  }
  
  private ensureMonthExists(date: Date): void {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    
    const exists = this.monthsSignal().some(m => 
      m.year === targetYear && m.month === targetMonth
    );
    
    if (!exists) {
      // Add month and re-sort chronologically
      this.monthsSignal.update(months => {
        const newMonth = {
          year: targetYear,
          month: targetMonth,
          id: `month-${targetYear}-${targetMonth}`
        };
        
        return [...months, newMonth].sort((a, b) => {
          const dateA = new Date(a.year, a.month, 1);
          const dateB = new Date(b.year, b.month, 1);
          return dateA.getTime() - dateB.getTime();
        });
      });
      
      // Scroll to the new month after it's rendered
      setTimeout(() => {
        const element = document.getElementById(`month-${targetYear}-${targetMonth}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
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
