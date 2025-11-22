import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomSheetDialog } from '../bottom-sheet-dialog/bottom-sheet-dialog';

export interface BottomMenuItem {
  action: string;
  icon: string; // SVG path for icon
  text: string;
  danger?: boolean;
  iconText?: string; // Optional text character instead of SVG (e.g., 'W', 'F', 'D')
  iconColor?: string; // Optional custom icon color for text icons
}

@Component({
  selector: 'app-bottom-menu',
  standalone: true,
  imports: [CommonModule, BottomSheetDialog],
  template: `
    <app-bottom-sheet-dialog [isOpen]="isOpen()" (closed)="closed.emit()">
      @if (title()) {
        <h3 class="jacaona-menu-title">{{ title() }}</h3>
      }
      @for (item of items(); track item.action; let last = $last) {
        <button 
          class="jacaona-menu-item"
          [class.jacaona-menu-item-danger]="item.danger"
          (click)="onItemClick(item.action)">
          @if (item.iconText) {
            <span class="jacaona-menu-icon jacaona-menu-icon-text"
              [class.jacaona-menu-icon-danger]="item.danger"
              [style.color]="item.iconColor || null">
              {{ item.iconText }}
            </span>
          } @else {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" 
              class="jacaona-menu-icon"
              [class.jacaona-menu-icon-danger]="item.danger">
              <path [attr.d]="item.icon"/>
            </svg>
          }
          <span class="jacaona-menu-text"
            [class.jacaona-menu-text-danger]="item.danger">
            {{ item.text }}
          </span>
        </button>
        @if (!last) {
          <div class="jacaona-menu-separator"></div>
        }
      }
    </app-bottom-sheet-dialog>
  `,
  styles: [`
    .jacaona-menu-title {
      color: var(--jacaona-text-primary);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
      margin: 0 0 var(--jacaona-space-md) 0;
      padding: var(--jacaona-space-sm) var(--jacaona-space-md);
      text-align: center;
    }

    .jacaona-menu-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--jacaona-space-md);
      padding: var(--jacaona-space-md);
      background: transparent;
      border: none;
      color: var(--jacaona-text-primary);
      font-size: 16px;
      cursor: pointer;
      border-radius: var(--jacaona-radius-md);
      transition: background-color 0.15s ease;
      text-align: left;
    }

    .jacaona-menu-item:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-menu-item:active {
      background: var(--jacaona-bg-tertiary);
      opacity: 0.8;
    }

    .jacaona-menu-item-danger:hover {
      background: rgba(255, 59, 48, 0.1);
    }

    .jacaona-menu-icon {
      flex-shrink: 0;
      color: var(--jacaona-text-primary);
    }

    .jacaona-menu-icon-text {
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-bold);
      display: inline-block;
      text-align: center;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .jacaona-menu-icon-danger {
      color: var(--jacaona-danger);
    }

    .jacaona-menu-text {
      flex: 1;
      font-weight: 500;
    }

    .jacaona-menu-text-danger {
      color: var(--jacaona-danger);
    }

    .jacaona-menu-separator {
      height: 1px;
      background: var(--jacaona-border);
      margin: var(--jacaona-space-xs) 0;
    }
  `]
})
export class BottomMenuComponent {
  isOpen = input.required<boolean>();
  items = input.required<BottomMenuItem[]>();
  title = input<string>();
  
  closed = output<void>();
  itemSelected = output<string>();

  onItemClick(action: string): void {
    this.itemSelected.emit(action);
  }
}
