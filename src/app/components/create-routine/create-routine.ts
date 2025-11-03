import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  currentWorkout = this.workoutService.currentWorkout;
  title: string = '';

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
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.router.navigate(['/workouts']);
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
