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
  
  @ViewChild('scrollContainer', { static: false }) scrollContainer?: ElementRef<HTMLElement>;

  // Store initial months for recentering
  private initialMonths: { year: number; month: number; id: string }[] = [];

  // Generate 5 months: 2 before current, current, 2 after current
  private monthsSignal = signal<{ year: number; month: number; id: string }[]>([]);
  private isLoadingSignal = signal(false);
  private hasInitializedSignal = signal(false);
  
  months = computed(() => this.monthsSignal());
  isLoading = computed(() => this.isLoadingSignal());
  
  constructor() {
    // Initialize with 5 months
    this.loadInitialMonths();
    // Store initial months for recentering
    this.initialMonths = this.monthsSignal();
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
        id: `month-${date.getFullYear()}-${date.getMonth()}`
      });
    }

    this.monthsSignal.set(months);
  }

  // Center view to initial months (previous/current/next)
  centerToInitialMonths(): void {
    // Reset months to initial
    this.monthsSignal.set([...this.initialMonths]);
    // Reset initialization flag to prevent lazy loading during scroll
    this.hasInitializedSignal.set(false);
    setTimeout(() => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      // Previous month
      const prevDate = new Date(currentYear, currentMonth - 1, 1);
      const prevId = `month-${prevDate.getFullYear()}-${prevDate.getMonth()}`;
      const previousMonthElement = document.getElementById(prevId);
      if (previousMonthElement) {
        // Use 'nearest' to avoid scrolling too far
        previousMonthElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      // Re-enable lazy loading after scroll completes
      setTimeout(() => this.hasInitializedSignal.set(true), 500);
    }, 100);
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
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      // Previous month
      const prevDate = new Date(currentYear, currentMonth - 1, 1);
      const prevId = `month-${prevDate.getFullYear()}-${prevDate.getMonth()}`;
      const previousMonthElement = document.getElementById(prevId);
      if (previousMonthElement) {
        // Use 'start' to align at top
        previousMonthElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      // Mark as initialized after initial scroll position is set
      setTimeout(() => {
        this.hasInitializedSignal.set(true);
      }, 200);
    }, 100);
  }
  
  onScroll(event: Event): void {
    // Don't trigger loading until after initial setup
    if (!this.hasInitializedSignal() || this.isLoadingSignal()) {
      return;
    }
    
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    const scrollThreshold = 500; // Load when within 500px of edge
    
    // Scrolling near top - load older months
    if (scrollTop < scrollThreshold) {
      this.loadOlderMonths();
    }
    
    // Scrolling near bottom - load newer months
    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      this.loadNewerMonths();
    }
  }
  
  private loadOlderMonths(): void {
    this.isLoadingSignal.set(true);
    
    const currentMonths = this.monthsSignal();
    if (currentMonths.length === 0) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    // Get the oldest month
    const oldestMonth = currentMonths[0];
    const oldDate = new Date(oldestMonth.year, oldestMonth.month, 1);
    
    // Add 3 months before the oldest
    const newMonths: { year: number; month: number; id: string }[] = [];
    for (let i = 3; i >= 1; i--) {
      const date = new Date(oldDate.getFullYear(), oldDate.getMonth() - i, 1);
      newMonths.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        id: `month-${date.getFullYear()}-${date.getMonth()}`
      });
    }
    
    // Preserve scroll position by storing current scroll offset
    const scrollContainer = this.scrollContainer?.nativeElement;
    if (!scrollContainer) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    const previousScrollTop = scrollContainer.scrollTop;
    const previousScrollHeight = scrollContainer.scrollHeight;
    
    this.monthsSignal.update(months => [...newMonths, ...months]);
    
    // Restore scroll position immediately after DOM update
    requestAnimationFrame(() => {
      if (scrollContainer) {
        const newScrollHeight = scrollContainer.scrollHeight;
        const heightDifference = newScrollHeight - previousScrollHeight;
        // Adjust scroll position to maintain the same visual position
        scrollContainer.scrollTop = previousScrollTop + heightDifference;
      }
      this.isLoadingSignal.set(false);
    });
  }
  
  private loadNewerMonths(): void {
    this.isLoadingSignal.set(true);
    
    const currentMonths = this.monthsSignal();
    if (currentMonths.length === 0) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    // Get the newest month
    const newestMonth = currentMonths[currentMonths.length - 1];
    const newDate = new Date(newestMonth.year, newestMonth.month, 1);
    
    // Add 3 months after the newest
    const newMonths: { year: number; month: number; id: string }[] = [];
    for (let i = 1; i <= 3; i++) {
      const date = new Date(newDate.getFullYear(), newDate.getMonth() + i, 1);
      newMonths.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        id: `month-${date.getFullYear()}-${date.getMonth()}`
      });
    }
    
    this.monthsSignal.update(months => [...months, ...newMonths]);
    
    setTimeout(() => {
      this.isLoadingSignal.set(false);
    }, 50);
  }
}
