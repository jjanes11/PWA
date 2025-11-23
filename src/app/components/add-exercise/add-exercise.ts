import { Component, signal, computed, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
import { RoutineService } from '../../services/routine.service';
import { DataStoreService } from '../../services/data-store.service';
import { Workout, Routine, WorkoutSource, WorkoutEntity } from '../../models/workout.models';

@Component({
  selector: 'app-add-exercise',
  imports: [FormsModule, TopBarComponent],
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
  
  // Entity context state (can be Workout or Routine)
  entity = signal<WorkoutEntity | null>(null);
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
        this.router.navigate(['/start-workout']);
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
        this.router.navigate(['/start-workout']);
        return;
      }

      this.entity.set(entity);
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

  recentExercises = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      return []; // Don't show recent exercises when searching
    }

    const workouts = this.dataStore.workoutsSignal()();
    const finishedWorkouts = workouts
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Get last 10 finished workouts

    const recentExerciseNames = new Set<string>();
    const recentExercisesList: Exercise[] = [];

    for (const workout of finishedWorkouts) {
      for (const exercise of workout.exercises) {
        if (!recentExerciseNames.has(exercise.name)) {
          recentExerciseNames.add(exercise.name);
          const exerciseData = this.exerciseService.allExercises().find(e => e.name === exercise.name);
          if (exerciseData) {
            recentExercisesList.push(exerciseData);
          }
        }
      }
    }

    return recentExercisesList.slice(0, 8); // Show max 8 recent exercises
  });

  allExercises = computed(() => {
    return this.filteredExercises();
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
    if (this.isReplaceMode()) {
      this.replaceExercise(exercise);
    } else {
      this.toggleExerciseSelection(exercise);
    }
  }

  private replaceExercise(exercise: Exercise): void {
    const entity = this.entity();
    const oldExerciseId = this.replaceExerciseId();
    const source = this.source();
    
    if (entity && oldExerciseId && source) {
      const updated = this.workoutService.replaceExercise(entity, oldExerciseId, exercise.name);
      this.saveToSource(updated, source);
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  private toggleExerciseSelection(exercise: Exercise): void {
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

  isExerciseSelected(exercise: Exercise): boolean {
    return this.selectedExercises().some(e => e.id === exercise.id);
  }

  addSelectedExercises(): void {
    const selected = this.selectedExercises();
    const entity = this.entity();
    const source = this.source();
    
    if (selected.length > 0 && entity && source) {
      const result = this.workoutService.addExercisesToWorkout(
        entity,
        selected.map(exercise => exercise.name),
        3
      );
      
      this.saveToSource(result.workout, source);
      console.log('Added exercises:', result.exercises);
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  /**
   * Save entity back to its source.
   * The source determines the entity type, so type assertions are safe.
   */
  private saveToSource(entity: WorkoutEntity, source: WorkoutSource): void {
    switch (source) {
      case WorkoutSource.ActiveWorkout:
        this.activeWorkoutService.setActiveWorkout(entity as Workout);
        break;
      case WorkoutSource.RoutineDraft:
        this.routineDraftService.setRoutineDraft(entity as Routine);
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
