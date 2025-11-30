import { Injectable, Type, ComponentRef, EnvironmentInjector, createComponent, inject, signal, ApplicationRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Configuration for dialog options
 */
export interface DialogConfig<T = any> {
  /** Data to pass to the dialog component */
  data?: T;
  /** Whether clicking backdrop closes the dialog */
  closeOnBackdropClick?: boolean;
  /** Custom CSS class for the dialog */
  panelClass?: string;
  /** Whether the dialog should be full-screen */
  fullScreen?: boolean;
}

/**
 * Reference to an opened dialog instance
 */
export class DialogRef<T = any, R = any> {
  private closeSubject = new Subject<R | undefined>();
  private componentRef: ComponentRef<any> | null = null;
  private overlayElement: HTMLElement | null = null;
  private appRef: ApplicationRef | null = null;

  /** Observable that emits when dialog is closed */
  afterClosed(): Observable<R | undefined> {
    return this.closeSubject.asObservable();
  }

  /**
   * Close the dialog with optional result data
   */
  close(result?: R): void {
    this.closeSubject.next(result);
    this.closeSubject.complete();
    this.destroy();
  }

  /** @internal Set component reference for cleanup */
  _setComponentRef(ref: ComponentRef<any>): void {
    this.componentRef = ref;
  }

  /** @internal Set overlay element for cleanup */
  _setOverlayElement(element: HTMLElement): void {
    this.overlayElement = element;
  }
  
  /** @internal Set application ref for view detachment */
  _setApplicationRef(appRef: ApplicationRef): void {
    this.appRef = appRef;
  }

  private destroy(): void {
    if (this.componentRef) {
      // Detach from Angular's change detection tree
      if (this.appRef) {
        this.appRef.detachView(this.componentRef.hostView);
      }
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }
}

/**
 * Service for opening modal dialogs
 * 
 * Usage:
 * ```typescript
 * this.dialogService
 *   .open(MyDialogComponent, { data: { workout } })
 *   .afterClosed()
 *   .subscribe(result => {
 *     if (result) {
 *       // Handle result
 *     }
 *   });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private injector = inject(EnvironmentInjector);
  private appRef = inject(ApplicationRef);

  /**
   * Open a dialog with the specified component
   */
  open<T, R = any>(
    component: Type<T>,
    config: DialogConfig = {}
  ): DialogRef<T, R> {
    const dialogRef = new DialogRef<T, R>();

    // Create overlay container
    const overlayElement = this.createOverlay(config, dialogRef);
    dialogRef._setOverlayElement(overlayElement);

    // Create dialog container
    const dialogContainer = this.createDialogContainer(overlayElement, config);

    // Create component dynamically
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
      hostElement: dialogContainer
    });

    // Inject DialogRef and config data into component
    this.injectDialogDependencies(componentRef, dialogRef, config.data);

    // Attach component to Angular's change detection tree
    this.appRef.attachView(componentRef.hostView);
    
    // Append to DOM
    document.body.appendChild(overlayElement);
    
    // Initial change detection
    componentRef.changeDetectorRef.detectChanges();

    dialogRef._setComponentRef(componentRef);
    dialogRef._setApplicationRef(this.appRef);

    return dialogRef;
  }

  private createOverlay(config: DialogConfig, dialogRef: DialogRef): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'jacaona-dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--jacaona-z-modal, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `;

    // Handle backdrop click
    if (config.closeOnBackdropClick !== false) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          dialogRef.close();
        }
      });
    }

    return overlay;
  }

  private createDialogContainer(parent: HTMLElement, config: DialogConfig): HTMLElement {
    const container = document.createElement('div');
    container.className = `jacaona-dialog-container ${config.panelClass || ''}`;
    
    if (config.fullScreen) {
      container.style.cssText = `
        background: var(--jacaona-bg-primary, #fff);
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      `;
    } else {
      container.style.cssText = `
        background: var(--jacaona-bg-primary, #fff);
        border-radius: var(--jacaona-radius-lg, 12px);
        max-width: 600px;
        width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
        box-shadow: var(--jacaona-shadow-lg, 0 10px 40px rgba(0, 0, 0, 0.2));
      `;
    }

    // Prevent click propagation to backdrop
    container.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    parent.appendChild(container);
    return container;
  }

  private injectDialogDependencies(
    componentRef: ComponentRef<any>,
    dialogRef: DialogRef,
    data?: any
  ): void {
    const instance = componentRef.instance;

    // Inject DialogRef
    if ('dialogRef' in instance) {
      instance.dialogRef = dialogRef;
    }

    // Inject data
    if (data && 'data' in instance) {
      instance.data = signal(data);
    }
  }
}

// Add global styles for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: 768px) {
      .jacaona-dialog-container {
        max-width: 100vw !important;
        max-height: 100vh !important;
        width: 100vw !important;
        height: 100vh !important;
        border-radius: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}
