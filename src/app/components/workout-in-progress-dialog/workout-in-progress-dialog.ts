import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-workout-in-progress-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmationDialog],
  template: `
    @if (showDialog()) {
      <div class="jacaona-dialog-overlay">
        <div class="jacaona-workout-progress-dialog">
          <h3 class="jacaona-dialog-title">Workout in Progress</h3>
          
          <div class="jacaona-dialog-actions">
            <button class="jacaona-dialog-action-btn jacaona-resume-btn" (click)="resume()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="jacaona-action-icon">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span class="jacaona-action-text">Resume</span>
            </button>
            
            <button class="jacaona-dialog-action-btn jacaona-discard-btn" (click)="showDiscardConfirmation()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="jacaona-action-icon">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              <span class="jacaona-action-text">Discard</span>
            </button>
          </div>
        </div>
      </div>
    }
    
    <app-confirmation-dialog
      [isVisible]="showConfirmDialog()"
      [message]="'Are you sure you want to discard this workout?'"
      [confirmText]="'Discard Workout'"
      [cancelText]="'Cancel'"
      (confirmed)="confirmDiscard()"
      (cancelled)="cancelDiscard()"
    />
  `,
  styles: [`
    .jacaona-dialog-overlay {
      position: fixed;
      bottom: calc(56px + env(safe-area-inset-bottom)); /* Touch top of navbar */
      left: 0;
      right: 0;
      background: transparent;
      z-index: 1001;
      padding: 0;
      animation: slideUp 0.3s ease;
      pointer-events: none;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .jacaona-workout-progress-dialog {
      background: var(--jacaona-bg-secondary);
      border-radius: 0;
      border-top: 1px solid var(--jacaona-border);
      padding: var(--jacaona-space-lg) var(--jacaona-space-xl);
      max-width: 100%;
      margin: 0;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
    }

    .jacaona-dialog-title {
      color: var(--jacaona-text-secondary);
      font-size: 14px;
      font-weight: var(--jacaona-font-weight-medium);
      text-align: center;
      margin: 0 0 var(--jacaona-space-lg) 0;
      letter-spacing: 0.5px;
    }

    .jacaona-dialog-actions {
      display: flex;
      gap: var(--jacaona-space-md);
    }

    .jacaona-dialog-action-btn {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--jacaona-space-sm);
      padding: var(--jacaona-space-md) var(--jacaona-space-lg);
      border: none;
      border-radius: var(--jacaona-radius-md);
      background: var(--jacaona-bg-tertiary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .jacaona-dialog-action-btn:active {
      transform: translateY(1px);
    }

    .jacaona-resume-btn {
      border: 1px solid var(--jacaona-accent-blue);
    }

    .jacaona-resume-btn:hover {
      background: rgba(10, 132, 255, 0.1);
    }

    .jacaona-resume-btn .jacaona-action-icon {
      color: var(--jacaona-accent-blue);
    }

    .jacaona-resume-btn .jacaona-action-text {
      color: var(--jacaona-accent-blue);
    }

    .jacaona-discard-btn {
      border: 1px solid var(--jacaona-danger);
    }

    .jacaona-discard-btn:hover {
      background: rgba(255, 59, 48, 0.1);
    }

    .jacaona-discard-btn .jacaona-action-icon {
      color: var(--jacaona-danger);
    }

    .jacaona-discard-btn .jacaona-action-text {
      color: var(--jacaona-danger);
    }

    .jacaona-action-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .jacaona-action-text {
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
    }
  `]
})
export class WorkoutInProgressDialog {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  showConfirmDialog = signal(false);

  // Track current route
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Hide dialog on specific pages
  private shouldHideOnCurrentRoute = computed(() => {
    const url = this.currentUrl();
    const hideDialogRoutes = ['/routine/new', '/add-exercise'];
    const isEditRoutine = url.match(/^\/routine\/edit\//);
    const isEditWorkout = url.match(/^\/edit-workout\//);
    const isWorkoutDetail = url.match(/^\/workout\/[^/]+$/) && !url.includes('/workout/new');
    return hideDialogRoutes.includes(url) || !!isEditRoutine || !!isEditWorkout || !!isWorkoutDetail;
  });

  // Only show dialog if workout service wants to show it AND we're not on a hidden route
  showDialog = computed(() => 
    this.workoutService.showWorkoutInProgressDialog() && !this.shouldHideOnCurrentRoute()
  );

  resume(): void {
    this.workoutService.hideWorkoutInProgressDialog();
    this.router.navigate(['/workout/new']);
  }

  showDiscardConfirmation(): void {
    this.showConfirmDialog.set(true);
  }

  confirmDiscard(): void {
    const workout = this.workoutService.currentWorkout();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.workoutService.hideWorkoutInProgressDialog();
    this.showConfirmDialog.set(false);
  }

  cancelDiscard(): void {
    this.showConfirmDialog.set(false);
  }
}
