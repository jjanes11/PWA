import { inject, Signal, signal, Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutService } from '../services/workout.service';
import { RoutineService } from '../services/routine.service';
import { ActiveWorkoutService } from '../services/active-workout.service';
import { RoutineDraftService } from '../services/routine-draft.service';
import { NavigationService } from '../services/navigation.service';

export type WorkoutSource = 'activeWorkout' | 'routineDraft' | 'persistedWorkout' | 'persistedRoutine';

/**
 * Resolves workout from navigation state by ID and source.
 * Supports: activeWorkout, routineDraft, and persistedWorkout.
 */
export function resolveWorkoutFromNavigation(): { workout: Workout | null; source: WorkoutSource | null } {
  const navigationService = inject(NavigationService);
  const workoutService = inject(WorkoutService);
  const routineService = inject(RoutineService);
  const activeWorkoutService = inject(ActiveWorkoutService);
  const routineDraftService = inject(RoutineDraftService);

  const workoutId = navigationService.getWorkoutId();
  const source = navigationService.getWorkoutSource();

  if (!workoutId || !source) {
    return { workout: null, source: null };
  }

  let workout: Workout | null = null;

  switch (source) {
    case 'activeWorkout':
      workout = activeWorkoutService.getActiveWorkout();
      break;
    case 'routineDraft':
      workout = routineDraftService.getRoutineDraft();
      break;
    case 'persistedWorkout':
      workout = workoutService.findWorkoutById(workoutId);
      break;
    case 'persistedRoutine':
      // Return routine directly - no conversion needed
      workout = routineService.findRoutineById(workoutId) as any;
      break;
  }

  return { workout, source };
}

/**
 * Updates workout based on its source.
 * Injectable service to ensure proper injection context.
 */
@Injectable()
export class WorkoutUpdater {
  private activeWorkoutService = inject(ActiveWorkoutService);
  private routineDraftService = inject(RoutineDraftService);
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);

  updateBySource(workout: Workout, source: WorkoutSource): void {
    switch (source) {
      case 'activeWorkout':
        this.activeWorkoutService.setActiveWorkout(workout);
        break;
      case 'routineDraft':
        this.routineDraftService.setRoutineDraft(workout);
        break;
      case 'persistedWorkout':
        this.workoutService.saveWorkout(workout);
        break;
      case 'persistedRoutine':
        // Save as routine directly - workout is actually a Routine
        this.routineService.saveRoutine(workout as any);
        break;
    }
  }
}
