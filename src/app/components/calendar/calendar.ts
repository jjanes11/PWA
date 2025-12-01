import { Component, inject, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { CalendarMonthComponent } from '../calendar-month/calendar-month';
import { CalendarWeekdaysComponent } from '../calendar-weekdays/calendar-weekdays';
import { DialogService } from '../../services/dialog.service';
import { DatePickerDialogComponent } from '../date-picker-dialog/date-picker-dialog';
import {
  MonthData,
  generateMonthRange,
  generateMonthsBefore,
  generateMonthsAfter,
  sortMonthsChronologically,
  findMonth,
  getPreviousMonth,
  formatDateYMD
} from '../../utils/calendar.utils';
import {
  setScrollPosition,
  getScrollPosition,
  isNearTop,
  isNearBottom,
  preserveScrollPosition,
  scrollToElementById
} from '../../utils/scroll.utils';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [TopBarComponent, CalendarMonthComponent, CalendarWeekdaysComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  
  @ViewChild('scrollContainer', { static: false }) scrollContainer?: ElementRef<HTMLElement>;

  // Constants
  private readonly INITIAL_MONTH_RANGE = { start: -2, end: 2 };
  private readonly MONTHS_TO_LOAD = 3;
  private readonly SCROLL_THRESHOLD = 500;
  private readonly RECENTER_TIMEOUT = 100;
  private readonly RECENTER_COMPLETE_TIMEOUT = 500;
  private readonly INITIAL_SCROLL_TIMEOUT = 100;

  // State
  private initialMonths: MonthData[] = [];
  private monthsSignal = signal<MonthData[]>([]);
  private isLoadingSignal = signal(false);
  private hasInitializedSignal = signal(false);
  
  // Computed
  months = computed(() => this.monthsSignal());
  isLoading = computed(() => this.isLoadingSignal());
  
  constructor() {
    this.loadInitialMonths();
    this.initialMonths = this.monthsSignal();
  }
  
  /**
   * Initialize calendar with 5 months centered on current month
   */
  private loadInitialMonths(): void {
    const { start, end } = this.INITIAL_MONTH_RANGE;
    const months = generateMonthRange(new Date(), start, end);
    this.monthsSignal.set(months);
  }

  /**
   * Reset calendar to initial view and scroll to previous month
   */
  centerToInitialMonths(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    
    const previousMonth = getPreviousMonth(new Date());
    const element = document.getElementById(previousMonth.id);
    
    // If previous month is visible, just scroll to it
    if (element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativePosition = elementRect.top - containerRect.top;
      
      container.scrollTo({
        top: relativePosition + container.scrollTop,
        behavior: 'smooth'
      });
    } else {
      // If not visible, reset months and scroll
      this.monthsSignal.set([...this.initialMonths]);
      this.hasInitializedSignal.set(false);
      
      setTimeout(() => {
        scrollToElementById(previousMonth.id, 'smooth');
        
        setTimeout(() => {
          this.hasInitializedSignal.set(true);
        }, this.RECENTER_COMPLETE_TIMEOUT);
      }, this.RECENTER_TIMEOUT);
    }
  }
  
  /**
   * Navigate back to analytics page
   */
  goBack(): void {
    this.router.navigate(['/analytics']);
  }
  
  /**
   * Open date picker dialog
   */
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
  
  /**
   * Jump to a specific date in the calendar
   */
  private jumpToDate(date: Date): void {
    this.ensureMonthExists(date);
    this.navigateToDayView(date);
  }
  
  /**
   * Navigate to day view for a specific date
   */
  private navigateToDayView(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateStr = formatDateYMD(year, month, day);
    this.router.navigate(['/calendar-day', dateStr]);
  }
  
  /**
   * Ensure a month exists in the calendar, adding it if necessary
   */
  private ensureMonthExists(date: Date): void {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    
    const exists = findMonth(this.monthsSignal(), targetYear, targetMonth);
    
    if (!exists) {
      this.addMonthAndScroll(targetYear, targetMonth);
    }
  }
  
  /**
   * Add a month to the calendar and scroll to it
   */
  private addMonthAndScroll(year: number, month: number): void {
    this.monthsSignal.update(months => {
      const newMonth: MonthData = { year, month, id: `month-${year}-${month}` };
      return sortMonthsChronologically([...months, newMonth]);
    });
    
    setTimeout(() => {
      scrollToElementById(`month-${year}-${month}`, 'smooth');
    }, this.RECENTER_TIMEOUT);
  }
  
  /**
   * Set initial scroll position after view initialization
   */
  ngAfterViewInit(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    setTimeout(() => {
      const previousMonth = getPreviousMonth(new Date());
      const element = document.getElementById(previousMonth.id);
      
      if (element && container) {
        // Calculate position relative to scrollable container
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativePosition = elementRect.top - containerRect.top;
        
        // Set scroll position so previous month appears at top of scrollable area
        container.scrollTop = relativePosition + container.scrollTop;
        
        this.hasInitializedSignal.set(true);
      }
    }, this.INITIAL_SCROLL_TIMEOUT);
  }
  
  /**
   * Handle scroll events for infinite loading
   */
  onScroll(event: Event): void {
    if (!this.hasInitializedSignal() || this.isLoadingSignal()) {
      return;
    }
    
    const container = event.target as HTMLElement;
    
    if (isNearTop(container, this.SCROLL_THRESHOLD)) {
      this.loadOlderMonths();
    }
    
    if (isNearBottom(container, this.SCROLL_THRESHOLD)) {
      this.loadNewerMonths();
    }
  }
  
  /**
   * Load older months (prepend to beginning)
   */
  private loadOlderMonths(): void {
    this.isLoadingSignal.set(true);
    
    const currentMonths = this.monthsSignal();
    if (currentMonths.length === 0) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    const oldestMonth = currentMonths[0];
    const newMonths = generateMonthsBefore(oldestMonth, this.MONTHS_TO_LOAD);
    
    this.prependMonthsAndPreserveScroll(newMonths);
  }
  
  /**
   * Load newer months (append to end)
   */
  private loadNewerMonths(): void {
    this.isLoadingSignal.set(true);
    
    const currentMonths = this.monthsSignal();
    if (currentMonths.length === 0) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    const newestMonth = currentMonths[currentMonths.length - 1];
    const newMonths = generateMonthsAfter(newestMonth, this.MONTHS_TO_LOAD);
    
    this.monthsSignal.update(months => [...months, ...newMonths]);
    
    setTimeout(() => {
      this.isLoadingSignal.set(false);
    }, 50);
  }
  
  /**
   * Prepend months while preserving scroll position
   */
  private prependMonthsAndPreserveScroll(newMonths: MonthData[]): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      this.isLoadingSignal.set(false);
      return;
    }
    
    const { top: previousTop, height: previousHeight } = getScrollPosition(container);
    
    this.monthsSignal.update(months => [...newMonths, ...months]);
    
    requestAnimationFrame(() => {
      if (container) {
        const newHeight = container.scrollHeight;
        container.scrollTop = preserveScrollPosition(previousTop, previousHeight, newHeight);
      }
      this.isLoadingSignal.set(false);
    });
  }
}
