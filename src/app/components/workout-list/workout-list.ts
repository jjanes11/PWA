import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout, WorkoutTemplate } from '../../models/workout.models';
import { NavigationService } from '../../services/navigation.service';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';

@Component({
  selector: 'app-workout-list',
  imports: [CommonModule, DraggableDirective],
  templateUrl: './workout-list.html',
  styleUrl: './workout-list.css'
})
export class WorkoutListComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);

  templates = this.workoutService.templates;
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  showWorkoutInProgressDialog = signal(false);
  selectedTemplateId = signal<string | null>(null);
  draggedTemplateId = signal<string | null>(null);
  dragOverTemplateId = signal<string | null>(null);

  startNewWorkout(): void {
    const currentWorkout = this.workoutService.currentWorkout();
    // Check if there's a workout in progress
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      this.showWorkoutInProgressDialog.set(true);
    } else {
      console.log('Navigating to /workout/new');
      this.router.navigate(['/workout/new']);
    }
  }

  resumeWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
    this.workoutService.hideWorkoutInProgressDialog();
    this.router.navigate(['/workout/new']);
  }

  confirmStartNewWorkout(): void {
    const currentWorkout = this.workoutService.currentWorkout();
    if (currentWorkout) {
      this.workoutService.deleteWorkout(currentWorkout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.workoutService.hideWorkoutInProgressDialog();
    this.showWorkoutInProgressDialog.set(false);
    this.router.navigate(['/workout/new']);
  }

  cancelStartNewWorkout(): void {
    this.showWorkoutInProgressDialog.set(false);
  }

  createNewRoutine(): void {
    this.navigationService.navigateWithReturnUrl('/routine/new', '/workouts');
  }

  startRoutine(template: WorkoutTemplate): void {
    const workout = this.workoutService.createWorkoutFromTemplate(template);
    this.router.navigate(['/workout/new']);
  }

  openMenu(templateId: string, event: Event): void {
    event.stopPropagation();
    this.selectedTemplateId.set(templateId);
    this.showMenu.set(true);
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  editRoutine(): void {
    const templateId = this.selectedTemplateId();
    if (templateId) {
      this.closeMenu();
      this.router.navigate(['/routine/edit', templateId]);
    }
  }

  deleteRoutine(): void {
    this.closeMenu();
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const templateId = this.selectedTemplateId();
    if (templateId) {
      this.workoutService.deleteTemplate(templateId);
    }
    this.showDeleteDialog.set(false);
    this.selectedTemplateId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  onTemplateReorder(event: DragReorderEvent): void {
    this.workoutService.reorderTemplates(event.fromId, event.toId);
  }
}
