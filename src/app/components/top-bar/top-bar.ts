import { Component, input, output } from '@angular/core';

import { IconComponent } from '../icon/icon';

export type TopBarButtonType = 'back' | 'menu' | 'text';

export interface TopBarButton {
  type: TopBarButtonType;
  text?: string; // For text buttons
  icon?: string; // SVG path for icon buttons
  disabled?: boolean;
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="jacaona-top-bar">
      <!-- Left Button -->
      @if (leftButton()) {
        @if (leftButton()!.type === 'back') {
          <button class="jacaona-back-btn" (click)="leftAction.emit()">
            <app-icon name="arrow-left" [size]="20" />
          </button>
        } @else if (leftButton()!.type === 'text') {
          <button class="jacaona-text-btn" (click)="leftAction.emit()">
            {{ leftButton()!.text }}
          </button>
        }
      } @else {
        <div class="jacaona-spacer"></div>
      }

      <!-- Title -->
      <h1 class="jacaona-page-title">{{ title() }}</h1>

      <!-- Right Button -->
      @if (rightButton()) {
        @if (rightButton()!.type === 'menu') {
          <button class="jacaona-menu-btn" (click)="rightAction.emit()">
            <app-icon name="menu-vertical" [size]="20" />
          </button>
        } @else if (rightButton()!.type === 'text') {
          <button 
            class="jacaona-save-btn" 
            [disabled]="rightButton()!.disabled"
            (click)="rightAction.emit()">
            {{ rightButton()!.text }}
          </button>
        }
      } @else {
        <div class="jacaona-spacer"></div>
      }
    </div>
  `,
  styles: [`
    .jacaona-top-bar {
      background: var(--jacaona-bg-secondary);
      padding: var(--jacaona-space-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--jacaona-border);
    }

    .jacaona-back-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: var(--jacaona-space-sm);
      border-radius: var(--jacaona-radius-md);
      display: flex;
      align-items: center;
      transition: background-color var(--jacaona-transition-fast);
    }

    .jacaona-back-btn:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-menu-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: var(--jacaona-space-sm);
      border-radius: var(--jacaona-radius-md);
      display: flex;
      align-items: center;
      transition: background-color var(--jacaona-transition-fast);
    }

    .jacaona-menu-btn:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-text-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: var(--jacaona-space-sm) var(--jacaona-space-md);
      border-radius: var(--jacaona-radius-md);
      font-size: 16px;
      transition: background-color var(--jacaona-transition-fast);
    }

    .jacaona-text-btn:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-save-btn {
      background: transparent;
      border: none;
      color: var(--jacaona-accent-blue);
      cursor: pointer;
      padding: var(--jacaona-space-sm) var(--jacaona-space-md);
      border-radius: var(--jacaona-radius-md);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-medium);
      transition: background-color var(--jacaona-transition-fast);
    }

    .jacaona-save-btn:hover:not(:disabled) {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-save-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .jacaona-page-title {
      color: white;
      font-size: 18px;
      font-weight: var(--jacaona-font-weight-semibold);
      margin: 0;
      flex: 1;
      text-align: center;
    }

    .jacaona-spacer {
      width: 40px;
    }
  `]
})
export class TopBarComponent {
  title = input.required<string>();
  leftButton = input<TopBarButton>();
  rightButton = input<TopBarButton>();
  
  leftAction = output<void>();
  rightAction = output<void>();
}
