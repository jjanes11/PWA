import { Component, input, output, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutCardComponent } from '../workout-card/workout-card';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { WorkoutService } from '../../services/workout.service';
import { MenuItem } from '../card-menu/card-menu';
import { Workout } from '../../models/workout.models';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [WorkoutCardComponent, ConfirmationDialog],
  template: `
    @if (workouts().length > 0) {
      <div class="jacaona-workout-list">
        @for (workout of workouts(); track workout.id) {
          <app-workout-card
            [workout]="workout"
            [formattedDate]="formatWorkoutDate(workout.date)"
            [duration]="calculateWorkoutDuration(workout)"
            [menuItems]="menuItems()"
            (cardClick)="onCardClick(workout.id)"
            (menuAction)="handleMenuAction(workout.id, $event)"
          />
        }
      </div>
    } @else {
      <div class="jacaona-workout-list__empty">
        <p class="jacaona-text-secondary">{{ emptyMessage() }}</p>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <app-confirmation-dialog
      [isVisible]="showDeleteDialog()"
      [message]="'Are you sure you want to delete this workout?'"
      [confirmText]="'Delete Workout'"
      [cancelText]="'Cancel'"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    />
  `,
  styles: [`
    .jacaona-workout-list {
      display: flex;
      flex-direction: column;
      gap: var(--jacaona-space-md);
    }

    .jacaona-workout-list__empty {
      padding: var(--jacaona-space-2xl) var(--jacaona-space-lg);
      text-align: center;
    }
  `]
})
export class WorkoutListComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  // Inputs
  workouts = input.required<Workout[]>();
  menuItems = input.required<MenuItem[]>();
  emptyMessage = input<string>('No workouts found');
  returnUrl = input<string | null>(null);

  // Outputs
  workoutDeleted = output<string>();

  // Internal state
  showDeleteDialog = signal(false);
  selectedWorkoutId = signal<string | null>(null);

  formatWorkoutDate(date: Date | string): string {
    const workoutDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return workoutDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  calculateWorkoutDuration(workout: Workout): string {
    if (workout.duration) {
      return `${workout.duration} min`;
    }
    return '0 min';
  }

  onCardClick(workoutId: string): void {
    const returnUrl = this.returnUrl();
    if (returnUrl) {
      this.router.navigate(['/workout', workoutId], {
        queryParams: { returnUrl }
      });
    } else {
      this.router.navigate(['/workout', workoutId]);
    }
  }

  handleMenuAction(workoutId: string, action: string): void {
    this.selectedWorkoutId.set(workoutId);
    
    switch (action) {
      case 'save-routine':
        this.saveAsRoutine();
        break;
      case 'edit':
        this.editWorkout();
        break;
      case 'delete':
        this.deleteWorkout();
        break;
    }
  }

  private saveAsRoutine(): void {
    const workoutId = this.selectedWorkoutId();
    const returnUrl = this.returnUrl();
    
    if (workoutId) {
      const navExtras = returnUrl 
        ? { queryParams: { sourceWorkoutId: workoutId, returnUrl } }
        : { queryParams: { sourceWorkoutId: workoutId } };
      
      this.router.navigate(['/routine/new'], navExtras);
    }
  }

  private editWorkout(): void {
    const workoutId = this.selectedWorkoutId();
    const returnUrl = this.returnUrl();
    
    if (workoutId) {
      const navExtras = returnUrl 
        ? { queryParams: { returnUrl } }
        : {};
      
      this.router.navigate(['/edit-workout', workoutId], navExtras);
    }
  }

  private deleteWorkout(): void {
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const workoutId = this.selectedWorkoutId();
    if (workoutId) {
      this.workoutService.deleteWorkout(workoutId);
      this.workoutDeleted.emit(workoutId);
    }
    this.showDeleteDialog.set(false);
    this.selectedWorkoutId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.selectedWorkoutId.set(null);
  }
}
