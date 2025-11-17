import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { NavigationService } from '../../services/navigation.service';
import { WorkoutContextService } from '../../utils/workout-context';
import { Workout } from '../../models/workout.models';

@Component({
  selector: 'app-add-exercise',
  imports: [CommonModule, FormsModule],
  providers: [WorkoutContextService],
  templateUrl: './add-exercise.html',
  styleUrl: './add-exercise.css'
})
export class AddExercise {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);
  private workoutContext = inject(WorkoutContextService);
  
  workout = this.workoutContext.workout;
  
  searchQuery = signal('');
  selectedExercises = signal<Exercise[]>([]);
  private returnUrl = signal<string>('/workout/new');
  isReplaceMode = signal(false);
  replaceExerciseId = signal<string | null>(null);

  constructor() {
    // Load workout from navigation state
    this.workoutContext.load();
    
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
      const workout = this.workout();
      const oldExerciseId = this.replaceExerciseId();
      
      if (workout && oldExerciseId) {
        const updatedWorkout = this.workoutService.replaceExercise(workout as Workout, oldExerciseId, exercise.name);
        this.workoutContext.save(updatedWorkout);
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
    const workout = this.workout();
    
    if (selected.length > 0 && workout) {
      const result = this.workoutService.addExercisesToWorkout(
        workout as Workout,
        selected.map(exercise => exercise.name),
        3
      );
      
      this.workoutContext.save(result.workout);
      console.log('Added exercises to workout:', result.exercises);
      this.router.navigate([this.returnUrl()]);
    }
  }
}
