import { inject, Signal } from '@angular/core';
import { Workout } from '../models/workout.models';
import { WorkoutSessionService } from '../services/workout-session.service';

export type WorkoutContextKind = 'active' | 'draft';

export interface WorkoutContext {
  workout: Signal<Workout | null>;
  setWorkout: (workout: Workout | null) => void;
  ensureFresh: (factory?: () => Workout) => Workout | null;
}

export function useWorkoutContext(kind: WorkoutContextKind): WorkoutContext {
  const workoutService = inject(WorkoutSessionService);
  const workoutSignal = kind === 'active'
    ? workoutService.activeWorkout
    : workoutService.routineDraft;

  const setWorkout = (workout: Workout | null) => {
    if (kind === 'active') {
      workoutService.setActiveWorkout(workout);
    } else {
      workoutService.setRoutineDraft(workout);
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

    const latest = workoutService.workouts().find(w => w.id === current!.id);
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
