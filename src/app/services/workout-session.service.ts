import { Injectable, Signal } from '@angular/core';
import { Workout, Routine, WorkoutStats, Exercise } from '../models/workout.models';
import { WorkoutLifecycleService } from './workout-lifecycle.service';
import { WorkoutPersistenceManagerService } from './workout-persistence-manager.service';
import { WorkoutStatsService } from './workout-stats.service';
import { WorkoutUiService } from './workout-ui.service';
import { IdService } from './id.service';
import { WorkoutEditorService } from './workout-editor.service';
import { createBaseWorkout, workoutFromTemplate, cloneWorkoutForDraft } from '../utils/workout-entity.utils';

/**
 * High-level façade for workout session orchestration.
 * Coordinates between lifecycle, persistence, editing, and UI services.
 * Does not access WorkoutStoreService directly.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutSessionService {
  constructor(
    private readonly lifecycle: WorkoutLifecycleService,
    private readonly persistence: WorkoutPersistenceManagerService,
    private readonly statsService: WorkoutStatsService,
    private readonly uiService: WorkoutUiService,
    private readonly idService: IdService,
    private readonly workoutEditor: WorkoutEditorService
  ) {}

  get workouts(): Signal<Workout[]> {
    return this.persistence.workoutsSignal();
  }

  get activeWorkout(): Signal<Workout | null> {
    return this.lifecycle.activeWorkoutSignal();
  }

  get routineDraft(): Signal<Workout | null> {
    return this.lifecycle.routineDraftSignal();
  }

  get workoutInProgressDialog(): Signal<boolean> {
    return this.uiService.workoutInProgressDialog;
  }

  get stats(): Signal<WorkoutStats> {
    return this.statsService.stats;
  }

  createWorkout(name: string): Workout {
    const workout = createBaseWorkout(name, this.withGeneratedIds());
    this.lifecycle.setActiveWorkout(workout);
    return workout;
  }

  createWorkoutFromRoutine(routine: Routine): Workout {
    const workout = workoutFromTemplate(routine, this.withGeneratedIds());
    this.lifecycle.setActiveWorkout(workout);
    return workout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.persistence.findWorkoutById(workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const draftWorkout = cloneWorkoutForDraft(sourceWorkout, this.withGeneratedIds());
    this.lifecycle.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const draftWorkout = createBaseWorkout(name, this.withGeneratedIds());
    this.lifecycle.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  clearRoutineDraft(): void {
    this.lifecycle.clearRoutineDraft();
  }

  saveWorkout(workout: Workout): void {
    this.persistence.saveWorkout(workout);
  }

  finishActiveWorkout(workout: Workout): void {
    this.persistence.finishWorkout(workout);
  }

  deleteWorkout(workoutId: string): void {
    this.persistence.deleteWorkout(workoutId);
  }

  setActiveWorkout(workout: Workout | null): void {
    this.lifecycle.setActiveWorkout(workout);
  }

  clearActiveWorkout(): void {
    this.lifecycle.clearActiveWorkout();
  }

  setRoutineDraft(workout: Workout | null): void {
    this.lifecycle.setRoutineDraft(workout);
  }

  updateDraft(workout: Workout): void {
    this.lifecycle.setRoutineDraft(workout);
  }

  updateActiveWorkout(workout: Workout): void {
    this.lifecycle.setActiveWorkout(workout);
  }

  completeWorkout(workoutId: string): void {
    this.persistence.updateWorkout(workoutId, workout => ({
      ...workout,
      completed: true,
      duration: this.calculateDuration(workout)
    }));
  }

  showWorkoutInProgressDialog(): void {
    this.uiService.showWorkoutInProgressDialog();
  }

  hideWorkoutInProgressDialog(): void {
    this.uiService.hideWorkoutInProgressDialog();
  }

  getWorkoutsSignal(): Signal<Workout[]> {
    return this.workouts;
  }

  getActiveWorkoutSnapshot(): Workout | null {
    return this.lifecycle.getActiveWorkoutSnapshot();
  }

  getWorkoutSnapshot(workoutId: string): Workout | null {
    return this.persistence.findWorkoutById(workoutId);
  }

  addExercisesWithDefaults(
    workoutId: string,
    exerciseNames: string[],
    defaultSetCount: number
  ): Exercise[] {
    const createdExercises: Exercise[] = [];

    exerciseNames.forEach(name => {
      const exercise = this.workoutEditor.addExerciseToWorkout(workoutId, name);
      this.workoutEditor.addDefaultSets(workoutId, exercise.id, defaultSetCount);
      createdExercises.push(exercise);
    });

    return createdExercises;
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.workoutEditor.replaceExerciseInWorkout(workoutId, exerciseId, newExerciseName);
  }

  private withGeneratedIds(): Parameters<typeof createBaseWorkout>[1] {
    return {
      idFactory: () => this.idService.generateId()
    };
  }

  private calculateDuration(workout: Workout): number {
    const now = new Date();
    const start = new Date(workout.date);
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60));
  }
}
