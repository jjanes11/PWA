import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { WorkoutSessionService } from '../../services/workout-session.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-add-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-exercise.html',
  styleUrl: './add-exercise.css'
})
export class AddExercise {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutSessionService);
  private navigationService = inject(NavigationService);
  
  searchQuery = signal('');
  selectedExercises = signal<Exercise[]>([]);
  private returnUrl = signal<string>('/workout/new');
  isReplaceMode = signal(false);
  replaceExerciseId = signal<string | null>(null);

  constructor() {
    // Get return URL from navigation service
    this.returnUrl.set(this.navigationService.getReturnUrl('/workout/new'));

    // Check if we're in replace mode
    const replaceId = this.navigationService.getReplaceExerciseId();
    if (replaceId) {
      this.isReplaceMode.set(true);
      this.replaceExerciseId.set(replaceId);
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
    this.navigationService.navigateWithReturnUrl('/create-exercise', this.returnUrl());
  }

  onSearchChange(): void {
    // Search is handled by the computed filteredExercises
  }

  selectExercise(exercise: Exercise): void {
    // In replace mode, immediately replace and navigate back
    if (this.isReplaceMode()) {
      const currentWorkout = this.workoutService.currentWorkout();
      const routineDraft = this.workoutService.routineDraft();
      const targetWorkout = currentWorkout || routineDraft;
      const oldExerciseId = this.replaceExerciseId();
      
      if (targetWorkout && oldExerciseId) {
        this.workoutService.replaceExerciseInWorkout(targetWorkout.id, oldExerciseId, exercise.name);
        this.router.navigate([this.returnUrl()]);
      }
    } else {
      // Normal add mode - toggle selection for multiple exercises
      const currentSelections = this.selectedExercises();
      const index = currentSelections.findIndex(e => e.id === exercise.id);
      
      if (index >= 0) {
        // Exercise is already selected, remove it
        const updated = [...currentSelections];
        updated.splice(index, 1);
        this.selectedExercises.set(updated);
      } else {
        // Exercise not selected, add it
        this.selectedExercises.set([...currentSelections, exercise]);
      }
    }
  }

  isExerciseSelected(exercise: Exercise): boolean {
    return this.selectedExercises().some(e => e.id === exercise.id);
  }

  addSelectedExercises(): void {
    const selected = this.selectedExercises();
    const currentWorkout = this.workoutService.currentWorkout();
    const routineDraft = this.workoutService.routineDraft();
    
    // Use whichever workout is available (currentWorkout or routineDraft)
    const targetWorkout = currentWorkout || routineDraft;
    
    if (selected.length > 0 && targetWorkout) {
      // Add each selected exercise to target workout
      selected.forEach(selectedExercise => {
        const exercise = this.workoutService.addExerciseToWorkout(targetWorkout.id, selectedExercise.name);
        
        // Add 3 default sets with 0 reps and weight
        for (let i = 0; i < 3; i++) {
          this.workoutService.addSetToExercise(targetWorkout.id, exercise.id);
        }
      });
      
      console.log('Added exercises to workout:', selected);
      this.router.navigate([this.returnUrl()]);
    }
  }
}
