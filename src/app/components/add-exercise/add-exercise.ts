import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-add-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-exercise.html',
  styleUrl: './add-exercise.css'
})
export class AddExercise {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  
  searchQuery = signal('');
  selectedExercise = signal<Exercise | null>(null);
  private returnUrl = signal<string>('/workout/new');

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

  filteredExercises = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.exerciseService.allExercises();
    }
    return this.exerciseService.allExercises().filter(exercise => 
      exercise.name.toLowerCase().includes(query) ||
      exercise.category.toLowerCase().includes(query)
    );
  });

  cancel(): void {
    this.router.navigate([this.returnUrl()]);
  }

  create(): void {
    this.router.navigate(['/create-exercise'], {
      state: { returnUrl: this.returnUrl() }
    });
  }

  onSearchChange(): void {
    // Search is handled by the computed filteredExercises
  }

  selectExercise(exercise: Exercise): void {
    // Toggle selection - if already selected, deselect; otherwise select
    const current = this.selectedExercise();
    if (current && current.id === exercise.id) {
      this.selectedExercise.set(null);
    } else {
      this.selectedExercise.set(exercise);
    }
  }

  addSelectedExercise(): void {
    const selected = this.selectedExercise();
    const currentWorkout = this.workoutService.currentWorkout();
    
    if (selected && currentWorkout) {
      // Add exercise to current workout
      const exercise = this.workoutService.addExerciseToWorkout(currentWorkout.id, selected.name);
      
      // Add 3 default sets with 0 reps and weight
      for (let i = 0; i < 3; i++) {
        this.workoutService.addSetToExercise(currentWorkout.id, exercise.id);
      }
      
      console.log('Added exercise to workout:', selected);
      this.router.navigate([this.returnUrl()]);
    }
  }
}
