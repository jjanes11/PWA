import { Injectable, Signal, signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutPersistenceService } from './workout-persistence.service';

@Injectable({ providedIn: 'root' })
export class WorkoutStoreService {
  private readonly workouts = signal<Workout[]>([]);
  private readonly routines = signal<Routine[]>([]);
  private readonly activeWorkout = signal<Workout | null>(null);
  private readonly routineDraft = signal<Workout | null>(null);

  constructor(private readonly persistence: WorkoutPersistenceService) {
    this.restoreFromPersistence();
  }

  workoutsSignal(): Signal<Workout[]> {
    return this.workouts.asReadonly();
  }

  routinesSignal(): Signal<Routine[]> {
    return this.routines.asReadonly();
  }

  activeWorkoutSignal(): Signal<Workout | null> {
    return this.activeWorkout.asReadonly();
  }

  routineDraftSignal(): Signal<Workout | null> {
    return this.routineDraft.asReadonly();
  }

  listWorkouts(): Workout[] {
    return this.workouts();
  }

  listRoutines(): Routine[] {
    return this.routines();
  }

  findWorkoutById(workoutId: string): Workout | null {
    const active = this.activeWorkout();
    if (active?.id === workoutId) {
      return active;
    }

    const draft = this.routineDraft();
    if (draft?.id === workoutId) {
      return draft;
    }

    return this.workouts().find(workout => workout.id === workoutId) ?? null;
  }

  findRoutineById(routineId: string): Routine | null {
    return this.routines().find(routine => routine.id === routineId) ?? null;
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
    // Try persisted workouts first
    const workouts = this.workouts();
    let updated: Workout | null = null;
    
    const next = workouts.map(workout => {
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

    // Try active workout
    const active = this.activeWorkout();
    if (active?.id === workoutId) {
      const updatedActive = mutate(active);
      this.activeWorkout.set(updatedActive);
      return updatedActive;
    }

    // Try routine draft
    const draft = this.routineDraft();
    if (draft?.id === workoutId) {
      const updatedDraft = mutate(draft);
      this.routineDraft.set(updatedDraft);
      return updatedDraft;
    }

    return null;
  }

  deleteWorkout(workoutId: string): void {
    const remaining = this.workouts().filter(w => w.id !== workoutId);
    this.setWorkouts(remaining);
    this.clearWorkoutReferences(workoutId);
  }

  mutateWorkout<T>(
    workoutId: string,
    mutator: (workout: Workout) => WorkoutMutationOutcome<T>
  ): WorkoutMutationOutcome<T> | null {
    const existingWorkout = this.findWorkoutById(workoutId);
    if (!existingWorkout) {
      return null;
    }

    const outcome = mutator(existingWorkout);
    this.updateWorkout(workoutId, () => outcome.workout);
    return outcome;
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

  clearWorkoutReferences(workoutId: string): void {
    if (this.activeWorkout()?.id === workoutId) {
      this.clearActiveWorkout();
    }

    if (this.routineDraft()?.id === workoutId) {
      this.clearRoutineDraft();
    }
  }

  private restoreFromPersistence(): void {
    const workouts = this.persistence.loadWorkouts();
    this.workouts.set(workouts);

    const routines = this.persistence.loadRoutines();
    this.routines.set(routines);
  }

  private setWorkouts(workouts: Workout[]): void {
    this.workouts.set(workouts);
    this.persistence.saveWorkouts(workouts);
  }

  private setRoutines(routines: Routine[]): void {
    this.routines.set(routines);
    this.persistence.saveRoutines(routines);
  }
}

export interface WorkoutMutationOutcome<T> {
  workout: Workout;
  derived?: T;
}
