import { Component, Input, Output, EventEmitter, HostListener, effect } from '@angular/core';


@Component({
  selector: 'app-bottom-sheet-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (isOpen) {
      <div class="jacaona-menu-overlay" (click)="onOverlayClick()">
        <div class="jacaona-bottom-menu" (click)="$event.stopPropagation()">
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styles: [
    `
    .jacaona-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: var(--jacaona-z-modal);
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease;
      overflow: hidden;
      touch-action: none;
    }

    .jacaona-bottom-menu {
      width: 100%;
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg) var(--jacaona-radius-lg) 0 0;
      padding: var(--jacaona-space-lg);
      animation: slideUp 0.3s ease;
      touch-action: auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    `
  ]
})
export class BottomSheetDialog {
  @Input() isOpen = false;
  @Input() closeOnOverlay = true;
  @Output() closed = new EventEmitter<void>();

  constructor() {
    // Prevent body scroll when dialog is open
    effect(() => {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });
  }

  ngOnDestroy() {
    // Ensure body scroll is restored when component is destroyed
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.isOpen && event.key === 'Escape') {
      this.closed.emit();
    }
  }
}
