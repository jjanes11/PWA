import { WorkoutEditorService } from '../services/workout-editor.service';
import { ExerciseActionEvent } from '../components/exercise-card/exercise-card';
import { SetTypeClickEvent } from '../components/sets-table/sets-table';
import { useSetTypeMenu } from './set-type-menu';
import { useExerciseSetMutations, ExerciseSetMutationsOptions } from './exercise-set-mutations';

export interface ExerciseCardControllerOptions extends ExerciseSetMutationsOptions {
  onReplaceExercise?: (exerciseId: string) => void;
  onRemoveExercise?: (exerciseId: string) => void;
}

export interface ExerciseCardController {
  handleAction: (event: ExerciseActionEvent) => boolean;
  openSetTypeMenu: (exerciseId: string, setId: string, event?: Event) => void;
  closeSetTypeMenu: () => void;
  showSetTypeMenu: ReturnType<typeof useSetTypeMenu>['isOpen'];
  selectedSet: ReturnType<typeof useSetTypeMenu>['selectedSet'];
}

export function useExerciseCardController(
  workoutEditor: WorkoutEditorService,
  options: ExerciseCardControllerOptions
): ExerciseCardController {
  const setTypeMenu = useSetTypeMenu();
  const setMutations = useExerciseSetMutations(workoutEditor, options);

  function handleAction(event: ExerciseActionEvent): boolean {
    if (setMutations.handle(event)) {
      return true;
    }

    if (event.type === 'menu') {
      const action = event.data as string | undefined;
      if (!action) {
        return true;
      }

      switch (action) {
        case 'replace':
          if (options.onReplaceExercise) {
            options.onReplaceExercise(event.exerciseId);
            return true;
          }
          return false;
        case 'remove': {
          if (options.onRemoveExercise) {
            options.onRemoveExercise(event.exerciseId);
            return true;
          }

          const workout = options.getWorkout();
          if (!workout) {
            return true;
          }

          const updatedWorkout = workoutEditor.removeExerciseFromWorkout(workout, event.exerciseId);
          options.onWorkoutUpdated(updatedWorkout);
          return true;
        }
        default:
          return false;
      }
    }

    if (event.type === 'set-type-click') {
      const data = event.data as SetTypeClickEvent | undefined;
      if (data) {
        setTypeMenu.open(event.exerciseId, data.setId, data.event);
      }
      return true;
    }

    return false;
  }

  return {
    handleAction,
    openSetTypeMenu: setTypeMenu.open,
    closeSetTypeMenu: setTypeMenu.close,
    showSetTypeMenu: setTypeMenu.isOpen,
    selectedSet: setTypeMenu.selectedSet
  };
}
