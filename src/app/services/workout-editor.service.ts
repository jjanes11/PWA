import { Injectable } from '@angular/core';
import { Exercise, Set as WorkoutSet, Workout } from '../models/workout.models';
import { WorkoutMutationError } from '../models/workout-errors';
import { exerciseMutations, setMutations } from '../utils/workout-mutations';

@Injectable({ providedIn: 'root' })
export class WorkoutEditorService {
  addExerciseToWorkout(workout: Workout, exerciseName: string): { workout: Workout; exercise: Exercise } {
    const result = exerciseMutations.add(workout, exerciseName);
    return { workout: result.workout, exercise: result.exercise };
  }

  removeExerciseFromWorkout(workout: Workout, exerciseId: string): Workout {
    return exerciseMutations.remove(workout, exerciseId);
  }

  replaceExerciseInWorkout(workout: Workout, exerciseId: string, newExerciseName: string): Workout {
    return exerciseMutations.replace(workout, exerciseId, newExerciseName);
  }

  reorderExercises(workout: Workout, draggedExerciseId: string, targetExerciseId: string): Workout {
    return exerciseMutations.reorder(workout, draggedExerciseId, targetExerciseId);
  }

  addSetToExercise(workout: Workout, exerciseId: string): { workout: Workout; set: WorkoutSet } {
    const result = setMutations.add(workout, exerciseId);

    if (!result.set) {
      throw WorkoutMutationError.exerciseNotFound(workout.id, exerciseId);
    }

    return { workout: result.workout, set: result.set };
  }

  addDefaultSets(workout: Workout, exerciseId: string, count: number): Workout {
    let current = workout;
    for (let i = 0; i < count; i++) {
      const result = this.addSetToExercise(current, exerciseId);
      current = result.workout;
    }
    return current;
  }

  updateSet(workout: Workout, exerciseId: string, set: WorkoutSet): Workout {
    return setMutations.update(workout, exerciseId, set);
  }

  removeSetFromExercise(workout: Workout, exerciseId: string, setId: string): Workout {
    return setMutations.remove(workout, exerciseId, setId);
  }
}
