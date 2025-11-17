import { Injectable, Signal, signal } from '@angular/core';
import { Workout } from '../models/workout.models';

/**
 * Manages the currently active (in-progress) workout state.
 * This is transient session state - not persisted until workout is finished.
 */
@Injectable({ providedIn: 'root' })
export class ActiveWorkoutService {
  private readonly activeWorkout = signal<Workout | null>(null);

  activeWorkoutSignal(): Signal<Workout | null> {
    return this.activeWorkout.asReadonly();
  }

  getActiveWorkout(): Workout | null {
    return this.activeWorkout();
  }

  setActiveWorkout(workout: Workout | null): void {
    this.activeWorkout.set(workout);
  }

  updateActiveWorkout(workout: Workout): void {
    this.activeWorkout.set(workout);
  }

  clearActiveWorkout(): void {
    this.activeWorkout.set(null);
  }

  hasActiveWorkout(): boolean {
    const workout = this.activeWorkout();
    return workout !== null && workout.exercises.length > 0;
  }
}
