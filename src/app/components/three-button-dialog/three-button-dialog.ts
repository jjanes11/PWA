import { Component, input, output } from '@angular/core';


@Component({
  selector: 'app-three-button-dialog',
  imports: [],
  template: `
    @if (isVisible()) {
      <div class="jacaona-dialog-overlay" (click)="onOverlayClick()">
        <div class="jacaona-dialog" (click)="$event.stopPropagation()">
          <p class="jacaona-dialog-message">{{ message() }}</p>
          @if (submessage()) {
            <p class="jacaona-dialog-submessage">{{ submessage() }}</p>
          }
          <button class="jacaona-dialog-btn jacaona-dialog-btn-primary" (click)="onPrimary()">
            {{ primaryText() }}
          </button>
          <button class="jacaona-dialog-btn jacaona-dialog-btn-danger-text" (click)="onDanger()">
            {{ dangerText() }}
          </button>
          <button class="jacaona-dialog-btn jacaona-dialog-btn-cancel" (click)="onCancel()">
            {{ cancelText() }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .jacaona-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jacaona-space-xl);
      animation: fadeIn 0.2s ease;
    }

    .jacaona-dialog {
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg);
      padding: var(--jacaona-space-xl);
      max-width: 400px;
      width: 100%;
      animation: scaleIn 0.3s ease;
    }

    .jacaona-dialog-message {
      color: var(--jacaona-text-primary);
      font-size: 16px;
      text-align: center;
      margin: 0 0 var(--jacaona-space-xl) 0;
      line-height: 1.5;
    }

    .jacaona-dialog-submessage {
      color: var(--jacaona-text-secondary);
      font-size: 14px;
      text-align: center;
      margin: 0 0 var(--jacaona-space-xl) 0;
      line-height: 1.5;
    }

    .jacaona-dialog-btn {
      width: 100%;
      padding: var(--jacaona-space-md);
      border: none;
      border-radius: var(--jacaona-radius-md);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: var(--jacaona-font-primary);
    }

    .jacaona-dialog-btn-primary {
      background: var(--jacaona-accent-blue);
      color: white;
      margin-bottom: var(--jacaona-space-sm);
    }

    .jacaona-dialog-btn-primary:hover {
      background: var(--jacaona-accent-blue-hover);
    }

    .jacaona-dialog-btn-danger-text {
      background: transparent;
      color: var(--jacaona-danger);
      margin-bottom: var(--jacaona-space-sm);
    }

    .jacaona-dialog-btn-danger-text:hover {
      background: rgba(255, 59, 48, 0.1);
    }

    .jacaona-dialog-btn-cancel {
      background: transparent;
      color: var(--jacaona-text-primary);
      border: 1px solid var(--jacaona-border);
    }

    .jacaona-dialog-btn-cancel:hover {
      background: var(--jacaona-bg-tertiary);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .jacaona-dialog-overlay {
        padding: var(--jacaona-space-md);
      }
    }
  `]
})
export class ThreeButtonDialog {
  isVisible = input<boolean>(false);
  message = input<string>('');
  submessage = input<string>('');
  primaryText = input<string>('Primary');
  dangerText = input<string>('Danger');
  cancelText = input<string>('Cancel');

  primaryAction = output<void>();
  dangerAction = output<void>();
  cancelled = output<void>();

  onPrimary(): void {
    this.primaryAction.emit();
  }

  onDanger(): void {
    this.dangerAction.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.cancelled.emit();
  }
}
