import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
import { RoutineService } from '../../services/routine.service';
import { DataStoreService } from '../../services/data-store.service';
import { Workout, Routine, WorkoutSource } from '../../models/workout.models';

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
  private dataStore = inject(DataStoreService);
  
  // Get query params
  private queryParams = toSignal(this.route.queryParams);
  
  // Workout context state
  workout = signal<Workout | Routine | null>(null);
  source = signal<WorkoutSource | null>(null);
  
  searchQuery = signal('');
  selectedExercises = signal<Exercise[]>([]);
  
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');
  isReplaceMode = computed(() => !!this.queryParams()?.['replaceExerciseId']);
  replaceExerciseId = computed(() => this.queryParams()?.['replaceExerciseId'] || null);

  constructor() {
    // Load workout context from query params
    effect(() => {
      const params = this.queryParams();
      const workoutId = params?.['workoutId'];
      const sourceParam = params?.['source'] as WorkoutSource;

      if (!workoutId || !sourceParam) {
        console.error('Missing workoutId or source in query params');
        this.router.navigate(['/workouts']);
        return;
      }

      let entity: Workout | Routine | null = null;

      switch (sourceParam) {
        case WorkoutSource.ActiveWorkout:
          const active = this.activeWorkoutService.getActiveWorkout();
          entity = active?.id === workoutId ? active : null;
          break;
          
        case WorkoutSource.RoutineDraft:
          const draft = this.routineDraftService.getRoutineDraft();
          entity = draft?.id === workoutId ? draft : null;
          break;
          
        case WorkoutSource.PersistedWorkout:
          entity = this.dataStore.findWorkoutById(workoutId);
          break;
          
        case WorkoutSource.PersistedRoutine:
          entity = this.dataStore.findRoutineById(workoutId);
          break;
      }

      if (!entity) {
        console.error(`Entity not found: ${workoutId} (source: ${sourceParam})`);
        this.router.navigate(['/workouts']);
        return;
      }

      this.workout.set(entity);
      this.source.set(sourceParam);
    });
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
      case WorkoutSource.ActiveWorkout:
        this.activeWorkoutService.setActiveWorkout(entity as Workout);
        break;
      case WorkoutSource.RoutineDraft:
        this.routineDraftService.setRoutineDraft(entity as Workout);
        break;
      case WorkoutSource.PersistedWorkout:
        this.workoutService.saveWorkout(entity as Workout);
        break;
      case WorkoutSource.PersistedRoutine:
        this.routineService.saveRoutine(entity as Routine);
        break;
    }
  }
}
