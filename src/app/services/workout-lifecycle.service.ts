import { Injectable, Signal, signal } from '@angular/core';
import { Workout } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';

/**
 * Manages workout lifecycle state (active workout, routine drafts).
 * Owns transient session state - does not persist.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutLifecycleService {
  private readonly activeWorkout = signal<Workout | null>(null);
  private readonly routineDraft = signal<Workout | null>(null);

  constructor(private readonly store: WorkoutStoreService) {}

  activeWorkoutSignal(): Signal<Workout | null> {
    return this.activeWorkout.asReadonly();
  }

  routineDraftSignal(): Signal<Workout | null> {
    return this.routineDraft.asReadonly();
  }

  setActiveWorkout(workout: Workout | null): void {
    this.activeWorkout.set(workout);
  }

  clearActiveWorkout(): void {
    this.activeWorkout.set(null);
  }

  setRoutineDraft(workout: Workout | null): void {
    this.routineDraft.set(workout);
  }

  clearRoutineDraft(): void {
    this.routineDraft.set(null);
  }

  getActiveWorkoutSnapshot(): Workout | null {
    return this.activeWorkout();
  }

  getRoutineDraftSnapshot(): Workout | null {
    return this.routineDraft();
  }

  clearWorkoutReferences(workoutId: string): void {
    if (this.activeWorkout()?.id === workoutId) {
      this.clearActiveWorkout();
    }

    if (this.routineDraft()?.id === workoutId) {
      this.clearRoutineDraft();
    }
  }

  findWorkoutById(workoutId: string): Workout | null {
    // Check session state first
    const active = this.activeWorkout();
    if (active?.id === workoutId) {
      return active;
    }

    const draft = this.routineDraft();
    if (draft?.id === workoutId) {
      return draft;
    }

    // Fall back to persisted workouts
    return this.store.findWorkoutById(workoutId);
  }

  updateWorkout(workoutId: string, mutate: (workout: Workout) => Workout): Workout | null {
    // Check if it's the active workout
    const active = this.activeWorkout();
    if (active?.id === workoutId) {
      const updated = mutate(active);
      this.activeWorkout.set(updated);
      return updated;
    }

    // Check if it's the routine draft
    const draft = this.routineDraft();
    if (draft?.id === workoutId) {
      const updated = mutate(draft);
      this.routineDraft.set(updated);
      return updated;
    }

    // Not in session state - delegate to store for persisted workouts
    return this.store.updateWorkout(workoutId, mutate);
  }
}
