import { Injectable, Signal, signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { StorageService } from './storage.service';

/**
 * Central repository for all persisted application data.
 * Manages workouts and routines.
 */
@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly workouts = signal<Workout[]>([]);
  private readonly routines = signal<Routine[]>([]);

  constructor(private readonly storage: StorageService) {
    this.restoreFromPersistence();
  }

  workoutsSignal(): Signal<Workout[]> {
    return this.workouts.asReadonly();
  }

  routinesSignal(): Signal<Routine[]> {
    return this.routines.asReadonly();
  }

  listWorkouts(): Workout[] {
    return this.workouts();
  }

  listRoutines(): Routine[] {
    return this.routines();
  }

  findWorkoutById(workoutId: string): Workout | null {
    return this.workouts().find(workout => workout.id === workoutId) ?? null;
  }

  findRoutineById(routineId: string): Routine | null {
    return this.routines().find(routine => routine.id === routineId) ?? null;
  }

  private setWorkouts(workouts: Workout[]): void {
    this.workouts.set(workouts);
    this.storage.saveWorkouts(workouts);
  }

  private setRoutines(routines: Routine[]): void {
    this.routines.set(routines);
    this.storage.saveRoutines(routines);
  }

  // Generic save/update helper
  private saveEntity<T extends { id: string }>(
    entities: T[],
    entity: T,
    setter: (entities: T[]) => void
  ): void {
    const index = entities.findIndex(e => e.id === entity.id);
    const updated = index >= 0
      ? entities.map(e => e.id === entity.id ? entity : e)
      : [...entities, entity];
    setter(updated);
  }

  // Generic update helper
  private updateEntity<T extends { id: string }>(
    entities: T[],
    entityId: string,
    mutate: (entity: T) => T,
    setter: (entities: T[]) => void
  ): T | null {
    let updated: T | null = null;
    
    const next = entities.map(entity => {
      if (entity.id === entityId) {
        updated = mutate(entity);
        return updated;
      }
      return entity;
    });

    if (updated) {
      setter(next);
    }

    return updated;
  }

  // Generic delete helper
  private deleteEntity<T extends { id: string }>(
    entities: T[],
    entityId: string,
    setter: (entities: T[]) => void
  ): void {
    const remaining = entities.filter(e => e.id !== entityId);
    setter(remaining);
  }

  saveWorkout(workout: Workout): void {
    this.saveEntity(this.workouts(), workout, (workouts) => this.setWorkouts(workouts));
  }

  updateWorkout(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    return this.updateEntity(
      this.workouts(),
      workoutId,
      mutate,
      (workouts) => this.setWorkouts(workouts)
    );
  }

  deleteWorkout(workoutId: string): void {
    this.deleteEntity(this.workouts(), workoutId, (workouts) => this.setWorkouts(workouts));
  }

  saveRoutine(routine: Routine): void {
    this.saveEntity(this.routines(), routine, (routines) => this.setRoutines(routines));
  }

  updateRoutine(
    routineId: string,
    mutate: (routine: Routine) => Routine
  ): Routine | null {
    return this.updateEntity(
      this.routines(),
      routineId,
      mutate,
      (routines) => this.setRoutines(routines)
    );
  }

  deleteRoutine(routineId: string): void {
    this.deleteEntity(this.routines(), routineId, (routines) => this.setRoutines(routines));
  }

  replaceAllRoutines(routines: Routine[]): void {
    this.setRoutines(routines);
  }

  private restoreFromPersistence(): void {
    const workouts = this.storage.loadWorkouts();
    this.workouts.set(workouts);

    const routines = this.storage.loadRoutines();
    this.routines.set(routines);
  }
}
