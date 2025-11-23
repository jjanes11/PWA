import { Component, signal, output, input } from '@angular/core';


@Component({
  selector: 'app-confirmation-dialog',
  imports: [],
  template: `
    @if (isVisible()) {
      <div class="jacaona-dialog-overlay" (click)="onOverlayClick()">
        <div class="jacaona-dialog-container" (click)="$event.stopPropagation()">
          <div class="jacaona-dialog-content">
            <p class="jacaona-dialog-message">{{ message() }}</p>
            
            <div class="jacaona-dialog-buttons">
              <button class="jacaona-dialog-btn jacaona-dialog-danger" (click)="onConfirm()">
                {{ confirmText() }}
              </button>
              <button class="jacaona-dialog-btn jacaona-dialog-cancel" (click)="onCancel()">
                {{ cancelText() }}
              </button>
            </div>
          </div>
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
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--jacaona-z-tooltip);
      padding: var(--jacaona-space-lg);
    }

    .jacaona-dialog-container {
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg);
      border: 1px solid var(--jacaona-bg-quaternary);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 100%;
    }

    .jacaona-dialog-content {
      padding: var(--jacaona-space-xl);
    }

    .jacaona-dialog-message {
      color: white;
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-medium);
      line-height: 1.5;
      margin: 0 0 var(--jacaona-space-xl) 0;
      text-align: center;
    }

    .jacaona-dialog-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--jacaona-space-md);
    }

    .jacaona-dialog-btn {
      width: 100%;
      padding: var(--jacaona-space-lg);
      border-radius: var(--jacaona-radius-md);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      font-family: var(--jacaona-font-primary);
    }

    .jacaona-dialog-danger {
      background: transparent;
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    .jacaona-dialog-danger:hover {
      background: #ef4444;
      color: white;
    }

    .jacaona-dialog-cancel {
      background: var(--jacaona-bg-tertiary);
      color: white;
      border: 1px solid var(--jacaona-bg-quaternary);
    }

    .jacaona-dialog-cancel:hover {
      background: var(--jacaona-bg-quaternary);
    }

    .jacaona-dialog-btn:active {
      transform: translateY(1px);
    }

    @media (max-width: 480px) {
      .jacaona-dialog-overlay {
        padding: var(--jacaona-space-md);
      }
      
      .jacaona-dialog-content {
        padding: var(--jacaona-space-lg);
      }
    }
  `]
})
export class ConfirmationDialog {
  isVisible = input<boolean>(false);
  message = input<string>('Are you sure?');
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.cancelled.emit();
  }
}
