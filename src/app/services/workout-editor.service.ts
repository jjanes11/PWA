import { Injectable } from '@angular/core';
import { Exercise, Set as WorkoutSet, Workout } from '../models/workout.models';
import { WorkoutStoreService, WorkoutMutationOutcome } from './workout-store.service';
import { IdService } from './id.service';
import { WorkoutMutationError } from '../models/workout-errors';
import {
  addExercise,
  removeExercise,
  replaceExercise,
  reorderExercises,
  addSet,
  updateSet,
  removeSet
} from '../utils/workout-mutations';

@Injectable({ providedIn: 'root' })
export class WorkoutEditorService {
  constructor(
    private readonly store: WorkoutStoreService,
    private readonly idService: IdService
  ) {}

  addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
    const outcome = this.mutateWorkout(
      workoutId,
      workout => {
        const result = addExercise(workout, exerciseName, {
          idFactory: () => this.idService.generateId()
        });

        return {
          workout: result.workout,
          derived: result.exercise
        };
      },
      WorkoutMutationError.workoutNotFound(workoutId)
    );

    if (!outcome.derived) {
      throw WorkoutMutationError.mutationFailed('addExerciseToWorkout', { workoutId });
    }

    return outcome.derived;
  }

  removeExerciseFromWorkout(workoutId: string, exerciseId: string): void {
    this.mutateWorkout<void>(workoutId, workout => ({
      workout: removeExercise(workout, exerciseId)
    }));
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.mutateWorkout<void>(workoutId, workout => ({
      workout: replaceExercise(workout, exerciseId, newExerciseName)
    }));
  }

  reorderExercises(workoutId: string, draggedExerciseId: string, targetExerciseId: string): void {
    this.mutateWorkout<void>(workoutId, workout => ({
      workout: reorderExercises(workout, draggedExerciseId, targetExerciseId)
    }));
  }

  addSetToExercise(workoutId: string, exerciseId: string): WorkoutSet {
    const outcome = this.mutateWorkout(
      workoutId,
      workout => {
        const result = addSet(workout, exerciseId, {
          idFactory: () => this.idService.generateId()
        });

        return {
          workout: result.workout,
          derived: result.set
        };
      },
      WorkoutMutationError.exerciseNotFound(workoutId, exerciseId)
    );

    if (!outcome.derived) {
      throw WorkoutMutationError.mutationFailed('addSetToExercise', {
        workoutId,
        exerciseId
      });
    }

    return outcome.derived;
  }

  addDefaultSets(workoutId: string, exerciseId: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.addSetToExercise(workoutId, exerciseId);
    }
  }

  updateSet(workoutId: string, exerciseId: string, set: WorkoutSet): void {
    this.mutateWorkout<void>(workoutId, workout => ({
      workout: updateSet(workout, exerciseId, set)
    }));
  }

  removeSetFromExercise(workoutId: string, exerciseId: string, setId: string): void {
    this.mutateWorkout<void>(workoutId, workout => ({
      workout: removeSet(workout, exerciseId, setId)
    }));
  }

  getWorkoutSnapshot(workoutId: string): Workout | null {
    return this.store.getWorkoutById(workoutId);
  }

  private mutateWorkout<T>(
    workoutId: string,
    mutator: (workout: Workout) => WorkoutMutationOutcome<T>,
    error: WorkoutMutationError = WorkoutMutationError.workoutNotFound(workoutId)
  ): WorkoutMutationOutcome<T> {
    const outcome = this.store.mutateWorkout(workoutId, mutator);
    if (!outcome) {
      throw error;
    }

    return outcome;
  }
}
