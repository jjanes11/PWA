import { Injectable, Signal, signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutPersistenceService } from './workout-persistence.service';

/**
 * Central repository for all persisted application data.
 * Manages workouts and routines - no session state.
 */
@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly workouts = signal<Workout[]>([]);
  private readonly routines = signal<Routine[]>([]);

  constructor(private readonly persistence: WorkoutPersistenceService) {
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
    this.persistence.saveWorkouts(workouts);
  }

  private setRoutines(routines: Routine[]): void {
    this.routines.set(routines);
    this.persistence.saveRoutines(routines);
  }

  saveWorkout(workout: Workout): void {
    const current = this.workouts();
    const index = current.findIndex(w => w.id === workout.id);
    
    const updated = index >= 0
      ? current.map(w => w.id === workout.id ? workout : w)
      : [...current, workout];
    
    this.setWorkouts(updated);
  }

  updateWorkout(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    let updated: Workout | null = null;
    
    const next = this.workouts().map(workout => {
      if (workout.id === workoutId) {
        updated = mutate(workout);
        return updated;
      }
      return workout;
    });

    if (updated) {
      this.setWorkouts(next);
      return updated;
    }

    return null;
  }

  deleteWorkout(workoutId: string): void {
    const remaining = this.workouts().filter(w => w.id !== workoutId);
    this.setWorkouts(remaining);
  }

  saveRoutine(routine: Routine): void {
    const current = this.routines();
    const index = current.findIndex(r => r.id === routine.id);
    
    const updated = index >= 0
      ? current.map(r => r.id === routine.id ? routine : r)
      : [...current, routine];
    
    this.setRoutines(updated);
  }

  updateRoutine(
    routineId: string,
    mutate: (routine: Routine) => Routine
  ): Routine | null {
    let updated: Routine | null = null;
    
    const next = this.routines().map(routine => {
      if (routine.id === routineId) {
        updated = mutate(routine);
        return updated;
      }
      return routine;
    });

    if (!updated) {
      return null;
    }

    this.setRoutines(next);
    return updated;
  }

  deleteRoutine(routineId: string): void {
    const remaining = this.routines().filter(r => r.id !== routineId);
    this.setRoutines(remaining);
  }

  replaceAllRoutines(routines: Routine[]): void {
    this.setRoutines(routines);
  }

  private restoreFromPersistence(): void {
    const workouts = this.persistence.loadWorkouts();
    this.workouts.set(workouts);

    const routines = this.persistence.loadRoutines();
    this.routines.set(routines);
  }
}
