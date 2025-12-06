import { Injectable, signal } from '@angular/core';

/**
 * Service to manage tooltip state across the application.
 * Ensures only one tooltip is open at a time.
 */
@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private openTooltipId = signal<string | null>(null);

  /**
   * Register a tooltip as open. Closes any previously open tooltip.
   */
  openTooltip(id: string): void {
    this.openTooltipId.set(id);
  }

  /**
   * Close a specific tooltip
   */
  closeTooltip(id: string): void {
    if (this.openTooltipId() === id) {
      this.openTooltipId.set(null);
    }
  }

  /**
   * Close all tooltips
   */
  closeAll(): void {
    this.openTooltipId.set(null);
  }

  /**
   * Check if a specific tooltip is open
   */
  isOpen(id: string): boolean {
    return this.openTooltipId() === id;
  }
}
