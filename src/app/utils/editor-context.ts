import { inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { NavigationService } from '../services/navigation.service';
import { useWorkoutContext, WorkoutContext, WorkoutContextKind } from './workout-context';
import { useDiscardGuard, DiscardGuard } from './discard-guard';
import { useNavigationContext, NavigationContext, NavigationContextOptions } from './navigation-context';

export interface EditorContext {
  workoutContext: WorkoutContext;
  navigation: NavigationContext;
  discard?: DiscardGuard;
}

export interface EditorContextOptions extends Partial<NavigationContextOptions> {
  kind: WorkoutContextKind;
  cleanupMode?: 'delete-workout' | 'none';
  discardConfig?: {
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  };
}

export function setupEditorContext(options: EditorContextOptions): EditorContext {
  const workoutService = inject(WorkoutService);
  const navigationService = inject(NavigationService);

  const workoutContext = useWorkoutContext(options.kind);
  const cleanupMode = options.cleanupMode ?? 'delete-workout';

  const navigation = useNavigationContext({
    defaultOrigin: options.defaultOrigin ?? '/workouts',
    cleanup: () => {
      if (cleanupMode === 'delete-workout') {
        const workout = workoutContext.workout();
        if (workout) {
          workoutService.deleteWorkout(workout.id);
          workoutContext.setWorkout(null);
        }
      }
      options.cleanup?.();
    },
  });

  let discard: DiscardGuard | undefined;
  if (options.discardConfig) {
    discard = useDiscardGuard(options.discardConfig);
  }

  return { workoutContext, navigation, discard };
}
