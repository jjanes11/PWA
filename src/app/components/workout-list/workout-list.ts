import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout, WorkoutTemplate } from '../../models/workout.models';

@Component({
  selector: 'app-workout-list',
  imports: [CommonModule],
  templateUrl: './workout-list.html',
  styleUrl: './workout-list.css'
})
export class WorkoutListComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  templates = this.workoutService.templates;
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  selectedTemplateId = signal<string | null>(null);

  startNewWorkout(): void {
    console.log('Navigating to /workout/new');
    this.router.navigate(['/workout/new']);
  }

  createNewRoutine(): void {
    this.router.navigate(['/routine/new']);
  }

  exploreRoutines(): void {
    console.log('Exploring routines...');
    // TODO: Navigate to routine exploration page
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
}
