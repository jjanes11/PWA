import { Injectable } from '@angular/core';
import { Exercise, Set as WorkoutSet, Workout, Routine } from '../models/workout.models';
import { WorkoutMutationError } from '../models/workout-errors';
import { exerciseMutations, setMutations } from '../utils/workout-mutations';

@Injectable({ providedIn: 'root' })
export class WorkoutEditorService {
  addExerciseToWorkout<T extends Workout | Routine>(workout: T, exerciseName: string): { workout: T; exercise: Exercise } {
    const result = exerciseMutations.add(workout, exerciseName);
    return { workout: result.workout as T, exercise: result.exercise };
  }

  removeExerciseFromWorkout<T extends Workout | Routine>(workout: T, exerciseId: string): T {
    return exerciseMutations.remove(workout, exerciseId) as T;
  }

  replaceExerciseInWorkout<T extends Workout | Routine>(workout: T, exerciseId: string, newExerciseName: string): T {
    return exerciseMutations.replace(workout, exerciseId, newExerciseName) as T;
  }

  reorderExercises<T extends Workout | Routine>(workout: T, draggedExerciseId: string, targetExerciseId: string): T {
    return exerciseMutations.reorder(workout, draggedExerciseId, targetExerciseId) as T;
  }

  addSetToExercise<T extends Workout | Routine>(workout: T, exerciseId: string): { workout: T; set: WorkoutSet } {
    const result = setMutations.add(workout, exerciseId);

    if (!result.set) {
      throw WorkoutMutationError.exerciseNotFound(workout.id, exerciseId);
    }

    return { workout: result.workout as T, set: result.set };
  }

  addDefaultSets<T extends Workout | Routine>(workout: T, exerciseId: string, count: number): T {
    let current = workout;
    for (let i = 0; i < count; i++) {
      const result = this.addSetToExercise(current, exerciseId);
      current = result.workout;
    }
    return current;
  }

  updateSet<T extends Workout | Routine>(workout: T, exerciseId: string, set: WorkoutSet): T {
    return setMutations.update(workout, exerciseId, set) as T;
  }

  removeSetFromExercise<T extends Workout | Routine>(workout: T, exerciseId: string, setId: string): T {
    return setMutations.remove(workout, exerciseId, setId) as T;
  }
}
