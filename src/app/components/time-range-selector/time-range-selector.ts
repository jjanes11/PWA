import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomMenuComponent, BottomMenuItem } from '../bottom-menu/bottom-menu';
import { TimeRange } from '../../models/analytics.models';

@Component({
  selector: 'app-time-range-selector',
  standalone: true,
  imports: [CommonModule, BottomMenuComponent],
  template: `
    <div class="jacaona-time-range-selector">
      <button
        class="jacaona-time-range-btn"
        (click)="toggleMenu()"
      >
        <span>{{ selectedRange() }}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>



    <app-bottom-menu
      [isOpen]="showMenu()"
      [items]="menuItems()"
      (itemSelected)="onMenuAction($event)"
      (closed)="onMenuClose()"
    />
  `,
  styles: [`
    .jacaona-time-range-selector {
      display: flex;
      justify-content: flex-end;
    }

    .jacaona-time-range-btn {
      display: flex;
      align-items: center;
      gap: var(--jacaona-space-sm);
      padding: var(--jacaona-space-sm) var(--jacaona-space-md);
      background: var(--jacaona-bg-secondary);
      border: 1px solid var(--jacaona-bg-quaternary);
      border-radius: var(--jacaona-radius-md);
      color: var(--jacaona-text-primary);
      font-size: var(--jacaona-font-size-sm);
      font-weight: var(--jacaona-font-weight-medium);
      cursor: pointer;
      transition: background-color var(--jacaona-transition-fast);
      font-family: var(--jacaona-font-primary);
    }

    .jacaona-time-range-btn:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-time-range-btn svg {
      color: var(--jacaona-text-secondary);
    }
  `]
})
export class TimeRangeSelectorComponent {
  selectedRange = input.required<TimeRange>();
  rangeChange = output<TimeRange>();

  showMenu = signal(false);

  menuItems = computed<BottomMenuItem[]>(() => [
    { 
      action: 'Last 3 months', 
      text: 'Last 3 months',
      icon: ''
    },
    { 
      action: 'Year', 
      text: 'Year',
      icon: ''
    },
    { 
      action: 'All time', 
      text: 'All time',
      icon: ''
    }
  ]);

  toggleMenu(): void {
    this.showMenu.update(v => !v);
  }

  onMenuAction(action: string): void {
    this.rangeChange.emit(action as TimeRange);
    this.showMenu.set(false);
  }

  onMenuClose(): void {
    this.showMenu.set(false);
  }
}
