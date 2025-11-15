import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutSessionService } from '../../services/workout-session.service';
import { WorkoutRoutineService } from '../../services/workout-template.service';
import { Routine } from '../../models/workout.models';
import { NavigationService } from '../../services/navigation.service';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';
import { CardMenuComponent, MenuItem } from '../card-menu/card-menu';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-workout-list',
  imports: [CommonModule, DraggableDirective, CardMenuComponent, ConfirmationDialog],
  templateUrl: './workout-list.html',
  styleUrl: './workout-list.css'
})
export class WorkoutListComponent {
  private router = inject(Router);
  private workoutSessionService = inject(WorkoutSessionService);
  private workoutRoutineService = inject(WorkoutRoutineService);
  private navigationService = inject(NavigationService);

  private pendingAction: (() => void) | null = null;

  routines = this.workoutRoutineService.routines;
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
    const activeWorkout = this.workoutSessionService.activeWorkout();
    if (activeWorkout && activeWorkout.exercises.length > 0) {
      this.pendingAction = () => {
        this.router.navigate(['/workout/new']);
      };
      this.workoutSessionService.hideWorkoutInProgressDialog();
      this.showWorkoutInProgressDialog.set(true);
      return;
    }

    this.router.navigate(['/workout/new']);
  }

  resumeWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
    this.pendingAction = null;
    this.workoutSessionService.hideWorkoutInProgressDialog();
    this.router.navigate(['/workout/new']);
  }

  confirmStartNewWorkout(): void {
    const activeWorkout = this.workoutSessionService.activeWorkout();
    if (activeWorkout) {
      this.workoutSessionService.deleteWorkout(activeWorkout.id);
      this.workoutSessionService.clearActiveWorkout();
    }

    this.workoutSessionService.hideWorkoutInProgressDialog();
    this.showWorkoutInProgressDialog.set(false);
    const action = this.pendingAction;
    this.pendingAction = null;
    action?.();
  }

  cancelStartNewWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
    this.pendingAction = null;
    this.workoutSessionService.hideWorkoutInProgressDialog();
  }

  createNewRoutine(): void {
    this.navigationService.navigateWithReturnUrl('/routine/new', '/workouts');
  }

  startRoutine(routine: Routine): void {
    const activeWorkout = this.workoutSessionService.activeWorkout();
    if (activeWorkout && activeWorkout.exercises.length > 0) {
      this.pendingAction = () => {
        this.workoutRoutineService.startWorkoutFromRoutine(routine);
        this.router.navigate(['/workout/new']);
      };
      this.workoutSessionService.hideWorkoutInProgressDialog();
      this.showWorkoutInProgressDialog.set(true);
      return;
    }

    this.workoutRoutineService.startWorkoutFromRoutine(routine);
    this.router.navigate(['/workout/new']);
  }

  handleMenuAction(routineId: string, action: string): void {
    this.selectedRoutineId.set(routineId);
    
    switch (action) {
      case 'edit':
        this.router.navigate(['/routine/edit', routineId]);
        break;
      case 'delete':
        this.showDeleteDialog.set(true);
        break;
    }
  }

  confirmDelete(): void {
    const routineId = this.selectedRoutineId();
    if (routineId) {
      this.workoutRoutineService.deleteRoutine(routineId);
    }
    this.showDeleteDialog.set(false);
    this.selectedRoutineId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  onRoutineReorder(event: DragReorderEvent): void {
    this.workoutRoutineService.reorderRoutines(event.fromId, event.toId);
  }
}
