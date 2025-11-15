import { WorkoutSessionService } from '../services/workout-session.service';
import { Workout, Set as WorkoutSet } from '../models/workout.models';
import { ExerciseActionEvent } from '../components/exercise-card/exercise-card';
import { SetChangeEvent, SetCompleteEvent } from '../components/sets-table/sets-table';

export interface ExerciseSetMutationsOptions {
  getWorkout: () => Workout | null;
  refreshWorkout?: (workoutId: string) => void;
}

interface ResolveResult {
  workout: Workout;
  set?: WorkoutSet;
}

export function useExerciseSetMutations(
  workoutService: WorkoutSessionService,
  options: ExerciseSetMutationsOptions
) {
  const { getWorkout, refreshWorkout } = options;

  function ensureRefresh(workoutId: string): void {
    refreshWorkout?.(workoutId);
  }

  function resolveSet(exerciseId: string, setId: string): ResolveResult | null {
    const workout = getWorkout();
    if (!workout) {
      return null;
    }

    const exercise = workout.exercises.find(e => e.id === exerciseId);
    if (!exercise) {
      return null;
    }

    const set = exercise.sets.find(s => s.id === setId);
    if (!set) {
      return null;
    }

    return { workout, set };
  }

  function addSet(exerciseId: string): void {
    const workout = getWorkout();
    if (!workout) {
      return;
    }

    workoutService.addSetToExercise(workout.id, exerciseId);
    ensureRefresh(workout.id);
  }

  function updateSetField(
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: number
  ): void {
    const result = resolveSet(exerciseId, setId);
    if (!result) {
      return;
    }

    const { workout, set } = result;
    const updatedSet: WorkoutSet = { ...set!, [field]: value };
    workoutService.updateSet(workout.id, exerciseId, updatedSet);
    ensureRefresh(workout.id);
  }

  function setCompletion(
    exerciseId: string,
    setId: string,
    completed: boolean
  ): void {
    const result = resolveSet(exerciseId, setId);
    if (!result) {
      return;
    }

    const { workout, set } = result;
    const updatedSet: WorkoutSet = { ...set!, completed };
    workoutService.updateSet(workout.id, exerciseId, updatedSet);
    ensureRefresh(workout.id);
  }

  function handle(event: ExerciseActionEvent): boolean {
    switch (event.type) {
      case 'add-set':
        addSet(event.exerciseId);
        return true;
      case 'set-change': {
        const data = event.data as SetChangeEvent | undefined;
        if (!data) {
          return true;
        }
        updateSetField(event.exerciseId, data.setId, data.field, data.value);
        return true;
      }
      case 'set-complete': {
        const data = event.data as SetCompleteEvent | undefined;
        if (!data) {
          return true;
        }
        setCompletion(event.exerciseId, data.setId, data.completed);
        return true;
      }
      default:
        return false;
    }
  }

  return {
    handle,
    addSet,
    updateSetField,
    setCompletion
  };
}
