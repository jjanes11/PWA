import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Workout, Routine } from '../models/workout.models';
import { DataStoreService } from '../services/data-store.service';
import { ActiveWorkoutService } from '../services/active-workout.service';
import { RoutineDraftService } from '../services/routine-draft.service';
import { WorkoutSource } from '../models/workout.models';

/**
 * Resolver for components that need workout/routine with source context.
 * Returns both the entity and its source.
 * 
 * Used by: add-exercise, edit components that need to save back to source
 * 
 * Example usage:
 * /add-exercise?workoutId=123&source=activeWorkout
 */
export interface WorkoutContextData {
  entity: Workout | Routine;
  source: WorkoutSource;
}

export const workoutContextResolver: ResolveFn<WorkoutContextData | null> = (
  route: ActivatedRouteSnapshot
) => {
  const router = inject(Router);
  const store = inject(DataStoreService);
  const activeWorkout = inject(ActiveWorkoutService);
  const routineDraft = inject(RoutineDraftService);

  const workoutId = route.queryParams['workoutId'];
  const source = route.queryParams['source'] as WorkoutSource;

  if (!workoutId || !source) {
    console.error('Missing workoutId or source in query params');
    router.navigate(['/workouts']);
    return null;
  }

  let entity: Workout | Routine | null = null;

  switch (source) {
    case 'activeWorkout':
      const active = activeWorkout.getActiveWorkout();
      entity = active?.id === workoutId ? active : null;
      break;
      
    case 'routineDraft':
      const draft = routineDraft.getRoutineDraft();
      entity = draft?.id === workoutId ? draft : null;
      break;
      
    case 'persistedWorkout':
      entity = store.findWorkoutById(workoutId);
      break;
      
    case 'persistedRoutine':
      entity = store.findRoutineById(workoutId);
      break;
  }

  if (!entity) {
    console.error(`Entity not found: ${workoutId} (source: ${source})`);
    router.navigate(['/workouts']);
    return null;
  }

  return { entity, source };
};
