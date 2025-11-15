import { Injectable, signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutPersistenceService } from './workout-persistence.service';

interface CommitOptions {
  persist?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkoutStoreService {
  private static readonly defaultCommitOptions = { persist: true } as const;

  private readonly _workouts = signal<Workout[]>([]);
  private readonly _routines = signal<Routine[]>([]);
  private readonly _currentWorkout = signal<Workout | null>(null);
  private readonly _routineDraft = signal<Workout | null>(null);

  readonly workouts = this._workouts.asReadonly();
  readonly routines = this._routines.asReadonly();
  readonly currentWorkout = this._currentWorkout.asReadonly();
  readonly routineDraft = this._routineDraft.asReadonly();
  constructor(private readonly persistence: WorkoutPersistenceService) {
    this.restoreFromPersistence();
  }

  private restoreFromPersistence(): void {
    const workouts = this.persistence.loadWorkouts();
    this._workouts.set(workouts);

    const routines = this.persistence.loadRoutines();
    this._routines.set(routines);
  }

  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout.set(workout);
  }

  clearCurrentWorkout(): void {
    this._currentWorkout.set(null);
  }

  setRoutineDraft(workout: Workout | null): void {
    this._routineDraft.set(workout);
  }

  clearRoutineDraft(): void {
    this._routineDraft.set(null);
  }

  getWorkouts(): Workout[] {
    return this._workouts();
  }

  getRoutines(): Routine[] {
    return this._routines();
  }

  commitWorkouts(
    workouts: Workout[],
    options?: CommitOptions
  ): void {
    const { persist } = { ...WorkoutStoreService.defaultCommitOptions, ...options };
    this._workouts.set(workouts);

    if (persist) {
      this.persistence.saveWorkouts(workouts);
    }
  }

  commitRoutines(routines: Routine[], options?: CommitOptions): void {
    const { persist } = { ...WorkoutStoreService.defaultCommitOptions, ...options };
    this._routines.set(routines);
    if (persist) {
      this.persistence.saveRoutines(routines);
    }
  }

  updateWorkoutById(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    const savedWorkouts = this._workouts();
    let updatedWorkout: Workout | null = null;
    const updatedWorkouts = savedWorkouts.map(workout => {
      if (workout.id !== workoutId) {
        return workout;
      }
      updatedWorkout = mutate(workout);
      return updatedWorkout;
    });

    if (updatedWorkout) {
      this.commitWorkouts(updatedWorkouts);
      return updatedWorkout;
    }

    const current = this._currentWorkout();
    if (current && current.id === workoutId) {
      const updatedCurrent = mutate(current);
      this._currentWorkout.set(updatedCurrent);
      return updatedCurrent;
    }

    const draft = this._routineDraft();
    if (draft && draft.id === workoutId) {
      const updatedDraft = mutate(draft);
      this._routineDraft.set(updatedDraft);
      return updatedDraft;
    }

    return null;
  }

  updateRoutineById(
    routineId: string,
    mutate: (routine: Routine) => Routine
  ): Routine | null {
    let updatedRoutine: Routine | null = null;
    const routines = this._routines().map(routine => {
      if (routine.id !== routineId) {
        return routine;
      }
      updatedRoutine = mutate(routine);
      return updatedRoutine;
    });

    if (!updatedRoutine) {
      return null;
    }

    this.commitRoutines(routines);
    return updatedRoutine;
  }

}
