import { inject, signal, Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutService } from '../services/workout.service';
import { RoutineService } from '../services/routine.service';
import { ActiveWorkoutService } from '../services/active-workout.service';
import { RoutineDraftService } from '../services/routine-draft.service';
import { NavigationService } from '../services/navigation.service';

export type WorkoutSource = 'activeWorkout' | 'routineDraft' | 'persistedWorkout' | 'persistedRoutine';

/**
 * Injectable service that manages workout context from navigation state.
 * Handles loading workout from correct source and saving updates back.
 */
@Injectable()
export class WorkoutContextService {
  private navigationService = inject(NavigationService);
  private activeWorkoutService = inject(ActiveWorkoutService);
  private routineDraftService = inject(RoutineDraftService);
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);

  private workoutSignal = signal<Workout | Routine | null>(null);
  private sourceSignal = signal<WorkoutSource | null>(null);

  workout = this.workoutSignal.asReadonly();
  source = this.sourceSignal.asReadonly();

  /**
   * Load workout from navigation state.
   * Call this in component initialization.
   */
  load(): void {
    const workoutId = this.navigationService.getWorkoutId();
    const source = this.navigationService.getWorkoutSource();

    if (!workoutId || !source) {
      this.workoutSignal.set(null);
      this.sourceSignal.set(null);
      return;
    }

    let workout: Workout | Routine | null = null;

    switch (source) {
      case 'activeWorkout':
        workout = this.activeWorkoutService.getActiveWorkout();
        break;
      case 'routineDraft':
        workout = this.routineDraftService.getRoutineDraft();
        break;
      case 'persistedWorkout':
        workout = this.workoutService.findWorkoutById(workoutId);
        break;
      case 'persistedRoutine':
        workout = this.routineService.findRoutineById(workoutId);
        break;
    }

    this.workoutSignal.set(workout);
    this.sourceSignal.set(source);
  }

  /**
   * Save updated workout back to its source.
   */
  save(workout: Workout | Routine): void {
    const source = this.sourceSignal();
    if (!source) return;

    switch (source) {
      case 'activeWorkout':
        this.activeWorkoutService.setActiveWorkout(workout as Workout);
        break;
      case 'routineDraft':
        this.routineDraftService.setRoutineDraft(workout as Workout);
        break;
      case 'persistedWorkout':
        this.workoutService.saveWorkout(workout as Workout);
        break;
      case 'persistedRoutine':
        this.routineService.saveRoutine(workout as Routine);
        break;
    }

    this.workoutSignal.set(workout);
  }
}
