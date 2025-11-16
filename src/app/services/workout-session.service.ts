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
    return this.store.workouts;
  }

  get activeWorkout(): Signal<Workout | null> {
    return this.store.activeWorkout;
  }

  get routineDraft(): Signal<Workout | null> {
    return this.store.routineDraft;
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
    const sourceWorkout = this.store.getWorkoutById(workoutId);
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

  updateWorkout(workout: Workout): void {
    this.store.replaceExistingWorkout(workout);
  }

  saveCompletedWorkout(workout: Workout): void {
    const updatedWorkouts = this.buildUpdatedWorkoutsSnapshot(workout);
    this.store.commitWorkouts(updatedWorkouts);
    this.store.clearWorkoutReferences(workout.id);
  }

  deleteWorkout(workoutId: string): void {
    const workouts = this.store.getWorkouts().filter(w => w.id !== workoutId);
    this.store.commitWorkouts(workouts);
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

  completeWorkout(workoutId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
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
    return this.store.getWorkoutById(workoutId);
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

  private buildUpdatedWorkoutsSnapshot(workout: Workout): Workout[] {
    // If the workout already exists, replace it. Otherwise, add it.
    const workouts = this.store.getWorkouts();
    const existingIndex = workouts.findIndex(saved => saved.id === workout.id);
    return existingIndex >= 0
      ? workouts.map(saved => (saved.id === workout.id ? workout : saved))
      : [...workouts, workout];
  }

}
