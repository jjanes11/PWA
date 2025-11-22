import { Component, input, output } from '@angular/core';


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
  imports: [],
  template: `
    <div class="jacaona-top-bar">
      <!-- Left Button -->
      @if (leftButton()) {
        @if (leftButton()!.type === 'back') {
          <button class="jacaona-back-btn" (click)="leftAction.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
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
      transition: background-color 0.15s ease;
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
      transition: background-color 0.15s ease;
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
      transition: background-color 0.15s ease;
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
      transition: background-color 0.15s ease;
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
