import { Injectable, Signal } from '@angular/core';
import { Workout, Routine, WorkoutStats, Exercise } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';
import { WorkoutStatsService } from './workout-stats.service';
import { WorkoutUiService } from './workout-ui.service';
import { IdService } from './id.service';
import { WorkoutEditorService } from './workout-editor.service';
import { createBaseWorkout, workoutFromTemplate, cloneWorkoutForDraft } from '../utils/workout-entity.utils';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionService {
  constructor(
    private readonly store: WorkoutStoreService,
    private readonly statsService: WorkoutStatsService,
    private readonly uiService: WorkoutUiService,
    private readonly idService: IdService,
    private readonly workoutEditor: WorkoutEditorService
  ) {}

  get workouts(): Signal<Workout[]> {
    return this.store.workoutsSignal();
  }

  get activeWorkout(): Signal<Workout | null> {
    return this.store.activeWorkoutSignal();
  }

  get routineDraft(): Signal<Workout | null> {
    return this.store.routineDraftSignal();
  }

  get workoutInProgressDialog(): Signal<boolean> {
    return this.uiService.workoutInProgressDialog;
  }

  get stats(): Signal<WorkoutStats> {
    return this.statsService.stats;
  }

  createWorkout(name: string): Workout {
    const workout = createBaseWorkout(name, this.withGeneratedIds());
    this.store.setActiveWorkout(workout);
    return workout;
  }

  createWorkoutFromRoutine(routine: Routine): Workout {
    const workout = workoutFromTemplate(routine, this.withGeneratedIds());
    this.store.setActiveWorkout(workout);
    return workout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.store.findWorkoutById(workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const draftWorkout = cloneWorkoutForDraft(sourceWorkout, this.withGeneratedIds());
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const draftWorkout = createBaseWorkout(name, this.withGeneratedIds());
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  clearRoutineDraft(): void {
    this.store.clearRoutineDraft();
  }

  saveWorkout(workout: Workout): void {
    this.store.saveWorkout(workout);
  }

  finishActiveWorkout(workout: Workout): void {
    this.store.saveWorkout(workout);
    this.store.clearWorkoutReferences(workout.id);
  }

  deleteWorkout(workoutId: string): void {
    this.store.deleteWorkout(workoutId);
  }

  setActiveWorkout(workout: Workout | null): void {
    this.store.setActiveWorkout(workout);
  }

  clearActiveWorkout(): void {
    this.store.clearActiveWorkout();
  }

  setRoutineDraft(workout: Workout | null): void {
    this.store.setRoutineDraft(workout);
  }

  updateDraft(workout: Workout): void {
    this.store.setRoutineDraft(workout);
  }

  updateActiveWorkout(workout: Workout): void {
    this.store.setActiveWorkout(workout);
  }

  completeWorkout(workoutId: string): void {
    this.store.updateWorkout(workoutId, workout => ({
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
    return this.activeWorkout();
  }

  getWorkoutSnapshot(workoutId: string): Workout | null {
    return this.store.findWorkoutById(workoutId);
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
