import { Injectable, Signal } from '@angular/core';
import { Workout } from '../models/workout.models';
import { DataStoreService } from './data-store.service';
import { WorkoutLifecycleService } from './workout-lifecycle.service';

/**
 * Handles workout persistence operations.
 * Encapsulates CRUD operations without exposing repository internals.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutPersistenceManagerService {
  constructor(
    private readonly store: DataStoreService,
    private readonly lifecycle: WorkoutLifecycleService
  ) {}

  workoutsSignal(): Signal<Workout[]> {
    return this.store.workoutsSignal();
  }

  saveWorkout(workout: Workout): void {
    this.store.saveWorkout(workout);
  }

  updateWorkout(workoutId: string, mutate: (workout: Workout) => Workout): Workout | null {
    return this.lifecycle.updateWorkout(workoutId, mutate);
  }

  deleteWorkout(workoutId: string): void {
    this.store.deleteWorkout(workoutId);
    this.lifecycle.clearWorkoutReferences(workoutId);
  }

  findWorkoutById(workoutId: string): Workout | null {
    return this.lifecycle.findWorkoutById(workoutId);
  }

  finishWorkout(workout: Workout): void {
    this.store.saveWorkout(workout);
    this.lifecycle.clearWorkoutReferences(workout.id);
  }
}
