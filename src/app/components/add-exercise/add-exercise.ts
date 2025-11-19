import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
import { RoutineService } from '../../services/routine.service';
import { Workout, Routine } from '../../models/workout.models';
import { WorkoutContextData } from '../../resolvers/workout-context.resolver';
import { WorkoutSource } from '../../models/workout.models';

@Component({
  selector: 'app-add-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-exercise.html',
  styleUrl: './add-exercise.css'
})
export class AddExercise {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private activeWorkoutService = inject(ActiveWorkoutService);
  private routineDraftService = inject(RoutineDraftService);
  private routineService = inject(RoutineService);
  
  // Get workout context from resolver
  private contextData = toSignal(
    this.route.data.pipe(map(data => data['context'] as WorkoutContextData | null))
  );
  
  workout = computed(() => this.contextData()?.entity || null);
  source = computed(() => this.contextData()?.source || null);
  
  searchQuery = signal('');
  selectedExercises = signal<Exercise[]>([]);
  
  // Get query params
  private queryParams = toSignal(this.route.queryParams);
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');
  isReplaceMode = computed(() => !!this.queryParams()?.['replaceExerciseId']);
  replaceExerciseId = computed(() => this.queryParams()?.['replaceExerciseId'] || null);

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
    this.router.navigateByUrl(this.returnUrl());
  }

  create(): void {
    const currentReturn = this.returnUrl();
    this.router.navigate(['/create-exercise'], {
      queryParams: { returnUrl: currentReturn }
    });
  }

  onSearchChange(): void {
    // Search is handled by the computed filteredExercises
  }

  selectExercise(exercise: Exercise): void {
    // In replace mode, immediately replace and navigate back
    if (this.isReplaceMode()) {
      const workout = this.workout();
      const oldExerciseId = this.replaceExerciseId();
      const source = this.source();
      
      if (workout && oldExerciseId && source) {
        const updatedWorkout = this.workoutService.replaceExercise(workout as Workout, oldExerciseId, exercise.name);
        this.saveToSource(updatedWorkout, source);
        this.router.navigateByUrl(this.returnUrl());
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
    const source = this.source();
    
    if (selected.length > 0 && workout && source) {
      const result = this.workoutService.addExercisesToWorkout(
        workout as Workout,
        selected.map(exercise => exercise.name),
        3
      );
      
      this.saveToSource(result.workout, source);
      console.log('Added exercises to workout:', result.exercises);
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  /**
   * Save workout back to its source.
   */
  private saveToSource(entity: Workout | Routine, source: WorkoutSource): void {
    switch (source) {
      case 'activeWorkout':
        this.activeWorkoutService.setActiveWorkout(entity as Workout);
        break;
      case 'routineDraft':
        this.routineDraftService.setRoutineDraft(entity as Workout);
        break;
      case 'persistedWorkout':
        this.workoutService.saveWorkout(entity as Workout);
        break;
      case 'persistedRoutine':
        this.routineService.saveRoutine(entity as Routine);
        break;
    }
  }
}
