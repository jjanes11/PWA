import { Injectable, signal } from '@angular/core';
import { Workout, WorkoutTemplate } from '../models/workout.models';
import { WorkoutPersistenceService } from './workout-persistence.service';

interface CommitOptions {
  persist?: boolean;
}

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

  private restoreFromPersistence(): void {
    const workouts = this.persistence.loadWorkouts();
    this._workouts.set(workouts);

    const templates = this.persistence.loadTemplates();
    this._templates.set(templates);
  }

  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout.set(workout);
  }

  setRoutineDraft(workout: Workout | null): void {
    this._routineDraft.set(workout);
  }

  getWorkouts(): Workout[] {
    return this._workouts();
  }

  getTemplates(): WorkoutTemplate[] {
    return this._templates();
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

  commitTemplates(templates: WorkoutTemplate[], options?: CommitOptions): void {
    const { persist } = { ...WorkoutStoreService.defaultCommitOptions, ...options };
    this._templates.set(templates);
    if (persist) {
      this.persistence.saveTemplates(templates);
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

}
