import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-duration-picker-dialog',
  standalone: true,
  imports: [],
  templateUrl: './duration-picker-dialog.html',
  styleUrl: './duration-picker-dialog.css'
})
export class DurationPickerDialogComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() initialDuration = 0; // in seconds
  @Output() closed = new EventEmitter<void>();
  @Output() durationSelected = new EventEmitter<number>(); // emits seconds

  @ViewChild('hoursScroll') hoursScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('minutesScroll') minutesScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('secondsScroll') secondsScroll?: ElementRef<HTMLDivElement>;

  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  // Generate number arrays for scrolling
  hoursArray = Array.from({ length: 25 }, (_, i) => i); // 0-24
  minutesArray = Array.from({ length: 60 }, (_, i) => i); // 0-59
  secondsArray = Array.from({ length: 60 }, (_, i) => i); // 0-59

  readonly ITEM_HEIGHT = 48; // Height of each item in pixels

  ngAfterViewInit() {
    if (this.isOpen) {
      this.initializeScrollPositions();
    }
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.parseDuration();
      setTimeout(() => this.initializeScrollPositions(), 0);
    }
  }

  private parseDuration(): void {
    const totalSeconds = this.initialDuration;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    this.hours.set(h);
    this.minutes.set(m);
    this.seconds.set(s);
  }

  private initializeScrollPositions(): void {
    if (this.hoursScroll) {
      this.hoursScroll.nativeElement.scrollTop = this.hours() * this.ITEM_HEIGHT;
    }
    if (this.minutesScroll) {
      this.minutesScroll.nativeElement.scrollTop = this.minutes() * this.ITEM_HEIGHT;
    }
    if (this.secondsScroll) {
      this.secondsScroll.nativeElement.scrollTop = this.seconds() * this.ITEM_HEIGHT;
    }
  }

  onHoursScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    const index = Math.round(element.scrollTop / this.ITEM_HEIGHT);
    this.hours.set(Math.max(0, Math.min(24, index)));
  }

  onHoursWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(0, Math.min(24, this.hours() + delta));
    this.hours.set(newValue);
    if (this.hoursScroll) {
      this.hoursScroll.nativeElement.scrollTop = newValue * this.ITEM_HEIGHT;
    }
  }

  onMinutesScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    const index = Math.round(element.scrollTop / this.ITEM_HEIGHT);
    this.minutes.set(Math.max(0, Math.min(59, index)));
  }

  onMinutesWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(0, Math.min(59, this.minutes() + delta));
    this.minutes.set(newValue);
    if (this.minutesScroll) {
      this.minutesScroll.nativeElement.scrollTop = newValue * this.ITEM_HEIGHT;
    }
  }

  onSecondsScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    const index = Math.round(element.scrollTop / this.ITEM_HEIGHT);
    this.seconds.set(Math.max(0, Math.min(59, index)));
  }

  onSecondsWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(0, Math.min(59, this.seconds() + delta));
    this.seconds.set(newValue);
    if (this.secondsScroll) {
      this.secondsScroll.nativeElement.scrollTop = newValue * this.ITEM_HEIGHT;
    }
  }

  onConfirm(): void {
    const totalSeconds = this.hours() * 3600 + this.minutes() * 60 + this.seconds();
    this.durationSelected.emit(totalSeconds);
    this.closed.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }

  onOverlayClick(): void {
    this.onCancel();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.onCancel();
    }
  }
}
