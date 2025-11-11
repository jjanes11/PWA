import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { createSetTypeMenuMixin } from '../../mixins/set-type-menu.mixin';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  currentWorkout = this.workoutService.currentWorkout;
  title: string = '';
  showCancelDialog = signal(false);
  private returnUrl = signal<string>('/workouts');
  
  // Set Type Menu Mixin
  private setTypeMenuMixin = createSetTypeMenuMixin(
    this.workoutService,
    () => this.currentWorkout(),
    () => this.currentWorkout()?.id || null
  );
  
  showSetTypeMenu = this.setTypeMenuMixin.showSetTypeMenu;
  selectedSet = this.setTypeMenuMixin.selectedSet;
  openSetTypeMenu = this.setTypeMenuMixin.openSetTypeMenu.bind(this.setTypeMenuMixin);
  closeSetTypeMenu = this.setTypeMenuMixin.closeSetTypeMenu.bind(this.setTypeMenuMixin);
  setSetType = this.setTypeMenuMixin.setSetType.bind(this.setTypeMenuMixin);
  removeSet = this.setTypeMenuMixin.removeSet.bind(this.setTypeMenuMixin);
  getSetTypeDisplay = this.setTypeMenuMixin.getSetTypeDisplay.bind(this.setTypeMenuMixin);
  getSetTypeClass = this.setTypeMenuMixin.getSetTypeClass.bind(this.setTypeMenuMixin);

  constructor() {
    // Check if we have a return URL from navigation state
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    if (state && state['returnUrl']) {
      this.returnUrl.set(state['returnUrl']);
    } else {
      // Check history state as fallback
      const historyState = history.state;
      if (historyState && historyState['returnUrl']) {
        this.returnUrl.set(historyState['returnUrl']);
      }
    }
  }

  ngOnInit(): void {
    // Create a draft workout to hold routine exercises
    if (!this.currentWorkout()) {
      this.workoutService.createWorkout('New Routine');
    } else {
      // Restore title from existing workout
      this.title = this.currentWorkout()?.name || '';
    }
  }

  cancel(): void {
    this.showCancelDialog.set(true);
  }

  onDiscardConfirmed(): void {
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.showCancelDialog.set(false);
    this.router.navigate([this.returnUrl()]);
  }

  onDiscardCancelled(): void {
    this.showCancelDialog.set(false);
  }

  save(): void {
    const workout = this.currentWorkout();
    if (workout) {
      // Create updated workout with the user's title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      
      // Update the workout first
      this.workoutService.updateWorkout(updatedWorkout);
      
      // Save as template for routines
      this.workoutService.saveAsTemplate(updatedWorkout);
      
      // Clean up draft workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.currentWorkout();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutService.updateWorkout(updatedWorkout);
    }
    
    // Navigate to add-exercise and return to this page after adding
    this.router.navigate(['/add-exercise'], {
      state: { returnUrl: '/routine/new' }
    });
  }

  addSetToExercise(exerciseId: string): void {
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.addSetToExercise(workout.id, exerciseId);
    }
  }

  updateSet(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number): void {
    const workout = this.currentWorkout();
    if (workout) {
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      const set = exercise?.sets.find(s => s.id === setId);
      if (set) {
        const updatedSet = { ...set, [field]: value };
        this.workoutService.updateSet(workout.id, exerciseId, updatedSet);
      }
    }
  }
}
