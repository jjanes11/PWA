import { Injectable } from '@angular/core';
import { Exercise, Set as WorkoutSet, Workout } from '../models/workout.models';
import { WorkoutStoreService, WorkoutMutationOutcome } from './workout-store.service';
import { IdService } from './id.service';
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
      `Workout ${workoutId} not found`
    );

    if (!outcome.derived) {
      throw new Error(`Failed to add exercise to workout ${workoutId}`);
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
      `Workout ${workoutId} or exercise ${exerciseId} not found`
    );

    if (!outcome.derived) {
      throw new Error(`Failed to add set to exercise ${exerciseId} in workout ${workoutId}`);
    }

    return outcome.derived;
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
    errorMessage = `Workout ${workoutId} not found`
  ): WorkoutMutationOutcome<T> {
    const outcome = this.store.mutateWorkout(workoutId, mutator);
    if (!outcome) {
      throw new Error(errorMessage);
    }

    return outcome;
  }
}
