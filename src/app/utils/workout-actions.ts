import { inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { Workout } from '../models/workout.models';
import { EditorContext } from './editor-context';
import { NavigationContext } from './navigation-context';

export interface WorkoutActionsConfig {
  editorContext: EditorContext;
  navigation?: NavigationContext;
}

export interface WorkoutActions {
  saveWorkout: (workout: Workout | null | undefined) => void;
  discardWorkout: (options?: { skipCleanup?: boolean }) => void;
}

export function useWorkoutActions(config: WorkoutActionsConfig): WorkoutActions {
  const workoutService = inject(WorkoutService);
  const navigation = config.navigation ?? config.editorContext.navigation;
  const discard = config.editorContext.discard;

  const saveWorkout = (workout: Workout | null | undefined) => {
    if (!workout) {
      return;
    }
    workoutService.saveWorkout(workout);
  };

  const discardWorkout = (options?: { skipCleanup?: boolean }) => {
    if (discard) {
      discard.open();
    } else {
      navigation.exit(options);
    }
  };

  return {
    saveWorkout,
    discardWorkout
  };
}
