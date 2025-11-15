import { Injectable, Signal, computed, signal } from '@angular/core';
import { Workout, WorkoutTemplate, WorkoutStats } from '../models/workout.models';

@Injectable({ providedIn: 'root' })
export class WorkoutStoreService {
  private readonly STORAGE_KEY = 'workout-tracker-data';
  private readonly TEMPLATES_KEY = 'workout-templates';

  private readonly _workouts = signal<Workout[]>([]);
  private readonly _templates = signal<WorkoutTemplate[]>([]);
  private readonly _currentWorkout = signal<Workout | null>(null);
  private readonly _routineDraft = signal<Workout | null>(null);
  private readonly _showWorkoutInProgressDialog = signal<boolean>(false);

  readonly workouts = this._workouts.asReadonly();
  readonly templates = this._templates.asReadonly();
  readonly currentWorkout = this._currentWorkout.asReadonly();
  readonly routineDraft = this._routineDraft.asReadonly();
  readonly showWorkoutInProgressDialog = this._showWorkoutInProgressDialog.asReadonly();

  readonly stats: Signal<WorkoutStats> = computed(() => {
    const workouts = this._workouts();
    const completed = workouts.filter(w => w.completed);

    const totalExercises = completed.reduce((sum, w) => sum + w.exercises.length, 0);
    const totalSets = completed.reduce((sum, w) =>
      sum + w.exercises.reduce((exerciseSum, e) => exerciseSum + e.sets.length, 0), 0
    );
    const totalWeight = completed.reduce((sum, w) =>
      sum + w.exercises.reduce((exerciseSum, e) =>
        exerciseSum + e.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0), 0
      ), 0
    );
    const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      totalWorkouts: completed.length,
      totalExercises,
      totalSets,
      totalWeight,
      averageDuration: completed.length > 0 ? totalDuration / completed.length : 0
    };
  });

  constructor() {
    this.loadWorkouts();
    this.loadTemplates();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  getWorkoutsSnapshot(): Workout[] {
    return this._workouts();
  }

  getTemplatesSnapshot(): WorkoutTemplate[] {
    return this._templates();
  }

  commitWorkouts(workouts: Workout[], updatedWorkout?: Workout | null): void {
    this._workouts.set(workouts);

    if (updatedWorkout) {
      this.syncDerivedWorkouts(updatedWorkout);
    } else {
      this.ensureDerivedWorkoutsExist(workouts);
    }

    this.saveWorkouts();
  }

  commitTemplates(templates: WorkoutTemplate[]): void {
    this._templates.set(templates);
    this.saveTemplates();
  }

  updateWorkoutById(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    let updatedWorkout: Workout | null = null;
    const workouts = this._workouts().map(workout => {
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

  showWorkoutDialog(): void {
    this._showWorkoutInProgressDialog.set(true);
  }

  hideWorkoutDialog(): void {
    this._showWorkoutInProgressDialog.set(false);
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
    if (current && !workouts.some(w => w.id === current.id)) {
      this._currentWorkout.set(null);
    }

    const draft = this._routineDraft();
    if (draft && !workouts.some(w => w.id === draft.id)) {
      this._routineDraft.set(null);
    }
  }

  private saveWorkouts(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._workouts()));
    } catch (error) {
      console.error('Failed to save workout data:', error);
    }
  }

  private saveTemplates(): void {
    try {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this._templates()));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  private loadWorkouts(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const workouts = JSON.parse(data) as Workout[];
        workouts.forEach(workout => {
          workout.date = new Date(workout.date);
        });
        this._workouts.set(workouts);
      }
    } catch (error) {
      console.error('Failed to load workout data:', error);
      this._workouts.set([]);
    }
  }

  private loadTemplates(): void {
    try {
      const data = localStorage.getItem(this.TEMPLATES_KEY);
      if (data) {
        const templates = JSON.parse(data) as WorkoutTemplate[];
        this._templates.set(templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      this._templates.set([]);
    }
  }
}
