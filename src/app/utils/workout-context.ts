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
      // Fetch routine and convert to workout format for editing
      const routine = routineService.findRoutineById(workoutId);
      if (routine) {
        workout = {
          id: routine.id,
          name: routine.name,
          date: new Date(),
          exercises: routine.exercises.map(routineExercise => ({
            id: routineExercise.id,
            name: routineExercise.name,
            sets: routineExercise.sets.map(routineSet => ({
              id: crypto.randomUUID(),
              reps: routineSet.reps,
              weight: routineSet.weight,
              completed: false,
              type: routineSet.type
            }))
          })),
          completed: false
        };
      }
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
        // Convert workout back to routine format and save
        const routine: Routine = {
          id: workout.id,
          name: workout.name,
          exercises: workout.exercises.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            sets: exercise.sets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              type: set.type
            }))
          }))
        };
        this.routineService.saveRoutine(routine);
        break;
    }
  }
}
