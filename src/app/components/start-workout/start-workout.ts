import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { RoutineService } from '../../services/routine.service';
import { WorkoutUiService } from '../../services/workout-ui.service';
import { Routine } from '../../models/workout.models';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';
import { CardMenuComponent, MenuItem } from '../card-menu/card-menu';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { ThreeButtonDialog } from '../three-button-dialog/three-button-dialog';
import { RoutineCardComponent } from '../routine-card/routine-card';

@Component({
  selector: 'app-start-workout',
  imports: [ConfirmationDialog, ThreeButtonDialog, RoutineCardComponent],
  templateUrl: './start-workout.html',
  styleUrl: './start-workout.css'
})
export class StartWorkoutComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);
  private uiService = inject(WorkoutUiService);

  private pendingAction: (() => void) | null = null;

  workouts = this.workoutService.workoutsSignal();
  routines = this.routineService.routinesSignal();
  showDeleteDialog = signal(false);
  showWorkoutInProgressDialog = signal(false);
  selectedRoutineId = signal<string | null>(null);
  draggedRoutineId = signal<string | null>(null);
  dragOverRoutineId = signal<string | null>(null);

  menuItems: MenuItem[] = [
    {
      action: 'edit',
      icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      text: 'Edit Routine'
    },
    {
      action: 'delete',
      icon: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
      text: 'Delete Routine',
      danger: true
    }
  ];

  startNewWorkout(): void {
    const activeWorkout = this.workoutService.getActiveWorkout();
    if (activeWorkout && activeWorkout.exercises.length > 0) {
      this.pendingAction = () => {
        this.router.navigate(['/workout/new']);
      };
      this.uiService.hideWorkoutInProgressDialog();
      this.showWorkoutInProgressDialog.set(true);
      return;
    }

    this.router.navigate(['/workout/new']);
  }

  resumeWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
    this.pendingAction = null;
    this.uiService.hideWorkoutInProgressDialog();
    this.router.navigate(['/workout/new']);
  }

  confirmStartNewWorkout(): void {
    const activeWorkout = this.workoutService.getActiveWorkout();
    if (activeWorkout) {
      this.workoutService.deleteWorkout(activeWorkout.id);
      this.workoutService.clearActiveWorkout();
    }

    this.uiService.hideWorkoutInProgressDialog();
    this.showWorkoutInProgressDialog.set(false);
    const action = this.pendingAction;
    this.pendingAction = null;
    action?.();
  }

  cancelStartNewWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
    this.pendingAction = null;
    this.uiService.hideWorkoutInProgressDialog();
  }

  createRoutine(): void {
    this.router.navigate(['/routine/new'], {
      queryParams: { returnUrl: '/workouts' }
    });
  }

  startRoutine(routine: Routine): void {
    const activeWorkout = this.workoutService.getActiveWorkout();
    if (activeWorkout && activeWorkout.exercises.length > 0) {
      this.pendingAction = () => {
        this.routineService.startWorkoutFromRoutine(routine);
        this.router.navigate(['/workout/new']);
      };
      this.uiService.hideWorkoutInProgressDialog();
      this.showWorkoutInProgressDialog.set(true);
      return;
    }

    this.routineService.startWorkoutFromRoutine(routine);
    this.router.navigate(['/workout/new']);
  }

  handleMenuAction(event: {routineId: string, action: string}): void {
    this.selectedRoutineId.set(event.routineId);
    
    switch (event.action) {
      case 'edit':
        this.router.navigate(['/routine/edit', event.routineId]);
        break;
      case 'delete':
        this.showDeleteDialog.set(true);
        break;
    }
  }

  confirmDelete(): void {
    const routineId = this.selectedRoutineId();
    if (routineId) {
      this.routineService.deleteRoutine(routineId);
    }
    this.showDeleteDialog.set(false);
    this.selectedRoutineId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  onRoutineReorder(event: DragReorderEvent): void {
    this.routineService.reorderRoutines(event.fromId, event.toId);
  }
}
