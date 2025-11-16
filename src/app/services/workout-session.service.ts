import { Injectable, Signal } from '@angular/core';
import { Workout, Exercise, Set as WorkoutSet, Routine, WorkoutStats } from '../models/workout.models';
import { WorkoutStoreService, WorkoutMutationOutcome } from './workout-store.service';
import { WorkoutStatsService } from './workout-stats.service';
import { WorkoutUiService } from './workout-ui.service';
import { IdService } from './id.service';
import {
  createBaseWorkout,
  workoutFromTemplate,
  cloneWorkoutForDraft
} from '../utils/workout-entity.utils';
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
export class WorkoutSessionService {
  constructor(
    private readonly store: WorkoutStoreService,
    private readonly statsService: WorkoutStatsService,
    private readonly uiService: WorkoutUiService,
    private readonly idService: IdService
  ) {}

  get workouts(): Signal<Workout[]> {
    return this.store.workouts;
  }

  get activeWorkout(): Signal<Workout | null> {
    return this.store.activeWorkout;
  }

  get routineDraft(): Signal<Workout | null> {
    return this.store.routineDraft;
  }

  get workoutInProgressDialog(): Signal<boolean> {
    return this.uiService.workoutInProgressDialog;
  }

  get stats(): Signal<WorkoutStats> {
    return this.statsService.stats;
  }

  createWorkout(name: string): Workout {
    const workout = createBaseWorkout(name, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setActiveWorkout(workout);
    return workout;
  }

  createWorkoutFromRoutine(routine: Routine): Workout {
    const workout = workoutFromTemplate(routine, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setActiveWorkout(workout);
    return workout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.store.getWorkoutById(workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const draftWorkout = cloneWorkoutForDraft(sourceWorkout, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const draftWorkout = createBaseWorkout(name, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  clearRoutineDraft(): void {
    this.store.clearRoutineDraft();
  }

  updateWorkout(workout: Workout): void {
    this.store.replaceExistingWorkout(workout);
  }

  saveCompletedWorkout(workout: Workout): void {
    const updatedWorkouts = this.buildUpdatedWorkoutsSnapshot(workout);
    this.store.commitWorkouts(updatedWorkouts);
    this.store.clearWorkoutReferences(workout.id);
  }

  deleteWorkout(workoutId: string): void {
    const workouts = this.store.getWorkouts().filter(w => w.id !== workoutId);
    this.store.commitWorkouts(workouts);
  }

  setActiveWorkout(workout: Workout | null): void {
    this.store.setActiveWorkout(workout);
  }

  clearActiveWorkout(): void {
    this.store.clearActiveWorkout();
  }

  setRoutineDraft(workout: Workout | null): void {
    this.store.setRoutineDraft(workout);
  }

  completeWorkout(workoutId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      completed: true,
      duration: this.calculateDuration(workout)
    }));
  }

  addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
    return this.mutateWorkout(
      workoutId,
      workout => addExercise(workout, exerciseName, {
        idFactory: () => this.idService.generateId()
      }),
      `Workout ${workoutId} not found`
    );
  }

  removeExerciseFromWorkout(workoutId: string, exerciseId: string): void {
    this.mutateWorkout(workoutId, workout => ({
      workout: removeExercise(workout, exerciseId)
    }));
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.mutateWorkout(workoutId, workout => ({
      workout: replaceExercise(workout, exerciseId, newExerciseName)
    }));
  }

  reorderExercises(workoutId: string, draggedExerciseId: string, targetExerciseId: string): void {
    this.mutateWorkout(workoutId, workout => ({
      workout: reorderExercises(workout, draggedExerciseId, targetExerciseId)
    }));
  }

  addSetToExercise(workoutId: string, exerciseId: string): WorkoutSet {
    return this.mutateWorkout(
      workoutId,
      workout => addSet(workout, exerciseId, {
        idFactory: () => this.idService.generateId()
      }),
      `Workout ${workoutId} or exercise ${exerciseId} not found`
    );
  }

  updateSet(workoutId: string, exerciseId: string, set: WorkoutSet): void {
    this.mutateWorkout(workoutId, workout => ({
      workout: updateSet(workout, exerciseId, set)
    }));
  }

  removeSetFromExercise(workoutId: string, exerciseId: string, setId: string): void {
    this.mutateWorkout(workoutId, workout => ({
      workout: removeSet(workout, exerciseId, setId)
    }));
  }

  private mutateWorkout<T>(
    workoutId: string,
    mutator: (workout: Workout) => WorkoutMutationOutcome<T>,
    errorMessage = `Workout ${workoutId} not found`
  ): T {
    const outcome = this.store.mutateWorkout(workoutId, mutator);
    if (!outcome) {
      throw new Error(errorMessage);
    }

    return outcome.derived as T;
  }

  showWorkoutInProgressDialog(): void {
    this.uiService.showWorkoutInProgressDialog();
  }

  hideWorkoutInProgressDialog(): void {
    this.uiService.hideWorkoutInProgressDialog();
  }

  getWorkoutsSignal(): Signal<Workout[]> {
    return this.workouts;
  }

  getActiveWorkoutSnapshot(): Workout | null {
    return this.activeWorkout();
  }

  private calculateDuration(workout: Workout): number {
    const now = new Date();
    const start = new Date(workout.date);
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60));
  }

  private buildUpdatedWorkoutsSnapshot(workout: Workout): Workout[] {
    // If the workout already exists, replace it. Otherwise, add it.
    const workouts = this.store.getWorkouts();
    const existingIndex = workouts.findIndex(saved => saved.id === workout.id);
    return existingIndex >= 0
      ? workouts.map(saved => (saved.id === workout.id ? workout : saved))
      : [...workouts, workout];
  }

}
