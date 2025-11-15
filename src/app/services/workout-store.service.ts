import { Injectable, signal } from '@angular/core';
import { Workout, WorkoutTemplate } from '../models/workout.models';
import { WorkoutPersistenceService } from './workout-persistence.service';

@Injectable({ providedIn: 'root' })
export class WorkoutStoreService {
  private static readonly defaultCommitOptions = { persist: true } as const;

  private readonly _workouts = signal<Workout[]>([]);
  private readonly _templates = signal<WorkoutTemplate[]>([]);
  private readonly _currentWorkout = signal<Workout | null>(null);
  private readonly _routineDraft = signal<Workout | null>(null);

  readonly workouts = this._workouts.asReadonly();
  readonly templates = this._templates.asReadonly();
  readonly currentWorkout = this._currentWorkout.asReadonly();
  readonly routineDraft = this._routineDraft.asReadonly();
  constructor(private readonly persistence: WorkoutPersistenceService) {
    this.restoreFromPersistence();
  }

  getWorkoutsSnapshot(): Workout[] {
    return this._workouts();
  }

  getTemplatesSnapshot(): WorkoutTemplate[] {
    return this._templates();
  }

  commitWorkouts(
    workouts: Workout[],
    updatedWorkout?: Workout | null,
    options?: CommitOptions
  ): void {
    const { persist } = { ...WorkoutStoreService.defaultCommitOptions, ...options };
    this._workouts.set(workouts);

    if (updatedWorkout) {
      this.syncDerivedWorkouts(updatedWorkout);
    } else {
      this.ensureDerivedWorkoutsExist(workouts);
    }

    if (persist) {
      this.persistWorkouts(workouts);
    }
  }

  commitTemplates(templates: WorkoutTemplate[], options?: CommitOptions): void {
    const { persist } = { ...WorkoutStoreService.defaultCommitOptions, ...options };
    this._templates.set(templates);
    if (persist) {
      this.persistTemplates(templates);
    }
  }

  updateWorkoutById(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    const currentWorkouts = this._workouts();
    if (!this.ensureWorkoutExists(currentWorkouts, workoutId)) {
      return null;
    }

    let updatedWorkout: Workout | null = null;
    const workouts = currentWorkouts.map(workout => {
      if (workout.id !== workoutId) {
        return workout;
      }
      updatedWorkout = mutate(workout);
      return updatedWorkout;
    });

    if (!updatedWorkout) {
      return null;
    }

    this.commitWorkouts(workouts, updatedWorkout);
    return updatedWorkout;
  }

  updateTemplateById(
    templateId: string,
    mutate: (template: WorkoutTemplate) => WorkoutTemplate
  ): WorkoutTemplate | null {
    let updatedTemplate: WorkoutTemplate | null = null;
    const templates = this._templates().map(template => {
      if (template.id !== templateId) {
        return template;
      }
      updatedTemplate = mutate(template);
      return updatedTemplate;
    });

    if (!updatedTemplate) {
      return null;
    }

    this.commitTemplates(templates);
    return updatedTemplate;
  }

  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout.set(workout);
  }

  setRoutineDraft(workout: Workout | null): void {
    this._routineDraft.set(workout);
  }

  clearRoutineDraft(): void {
    this._routineDraft.set(null);
  }

  private syncDerivedWorkouts(updatedWorkout: Workout): void {
    if (this._currentWorkout()?.id === updatedWorkout.id) {
      this._currentWorkout.set(updatedWorkout);
    }

    if (this._routineDraft()?.id === updatedWorkout.id) {
      this._routineDraft.set(updatedWorkout);
    }
  }

  private ensureDerivedWorkoutsExist(workouts: Workout[]): void {
    const current = this._currentWorkout();
    if (!this.ensureWorkoutExists(workouts, current?.id)) {
      this._currentWorkout.set(null);
    }

    const draft = this._routineDraft();
    if (!this.ensureWorkoutExists(workouts, draft?.id)) {
      this._routineDraft.set(null);
    }
  }

  private restoreFromPersistence(): void {
    const workouts = this.persistence.loadWorkouts();
    this._workouts.set(workouts);

    const templates = this.persistence.loadTemplates();
    this._templates.set(templates);
  }

  private ensureWorkoutExists(
    workouts: Workout[],
    workoutId: string | null | undefined
  ): workoutId is string {
    return !!workoutId && workouts.some(workout => workout.id === workoutId);
  }

  private persistWorkouts(workouts: Workout[]): void {
    this.persistence.saveWorkouts(workouts);
  }

  private persistTemplates(templates: WorkoutTemplate[]): void {
    this.persistence.saveTemplates(templates);
  }
}

interface CommitOptions {
  persist?: boolean;
}
