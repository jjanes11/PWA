import { inject, Signal } from '@angular/core';
import { Workout } from '../models/workout.models';
import { WorkoutService } from '../services/workout.service';
import { RoutineService } from '../services/routine.service';
import { ActiveWorkoutService } from '../services/active-workout.service';
import { RoutineDraftService } from '../services/routine-draft.service';

export type WorkoutContextKind = 'active' | 'draft';

export interface WorkoutContext {
  workout: Signal<Workout | null>;
  setWorkout: (workout: Workout | null) => void;
  ensureFresh: (factory?: () => Workout) => Workout | null;
}

export function useWorkoutContext(kind: WorkoutContextKind): WorkoutContext {
  const workoutService = inject(WorkoutService);
  const activeWorkoutService = inject(ActiveWorkoutService);
  const routineDraftService = inject(RoutineDraftService);

  const workoutSignal = kind === 'active'
    ? activeWorkoutService.activeWorkoutSignal()
    : routineDraftService.routineDraftSignal();

  const setWorkout = (workout: Workout | null) => {
    if (kind === 'active') {
      activeWorkoutService.setActiveWorkout(workout);
    } else {
      routineDraftService.setRoutineDraft(workout);
    }
  };

  const ensureFresh = (factory?: () => Workout): Workout | null => {
    let current = workoutSignal();

    if (!current && factory) {
      current = factory();
      if (current) {
        setWorkout(current);
      }
      return current ?? null;
    }

    if (!current) {
      return null;
    }

    // Fetch latest from persisted storage to ensure we have the most recent data
    const latest = workoutService.workoutsSignal()().find(w => w.id === current!.id);
    if (latest && latest !== current) {
      setWorkout(latest);
      return latest;
    }

    return current;
  };

  return {
    workout: workoutSignal,
    setWorkout,
    ensureFresh
  };
}
