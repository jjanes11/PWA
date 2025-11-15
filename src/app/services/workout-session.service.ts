import { Injectable, Signal } from '@angular/core';
import { Workout, Exercise, Set as WorkoutSet, WorkoutTemplate, WorkoutStats } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';
import { WorkoutStatsService } from './workout-stats.service';
import { WorkoutUiService } from './workout-ui.service';
import { IdService } from './id.service';
import {
  createBaseWorkout,
  workoutFromTemplate,
  cloneWorkoutForDraft
} from '../utils/workout-entity.utils';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionService {
  constructor(
    private readonly store: WorkoutStoreService,
    private readonly statsService: WorkoutStatsService,
    private readonly uiService: WorkoutUiService,
    private readonly idService: IdService
  ) {}

  get workouts(): Signal<Workout[]> {
    return this.store.workouts;
  }

  get currentWorkout(): Signal<Workout | null> {
    return this.store.currentWorkout;
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
    const workout = createBaseWorkout(name, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setCurrentWorkout(workout);
    return workout;
  }

  createWorkoutFromTemplate(template: WorkoutTemplate): Workout {
    const workout = workoutFromTemplate(template, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setCurrentWorkout(workout);
    return workout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.store.getWorkouts().find(w => w.id === workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const draftWorkout = cloneWorkoutForDraft(sourceWorkout, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const draftWorkout = createBaseWorkout(name, {
      idFactory: () => this.idService.generateId()
    });
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  clearRoutineDraft(): void {
    this.store.setRoutineDraft(null);
  }

  updateWorkout(workout: Workout): void {
    if (this.store.currentWorkout() && this.store.currentWorkout()!.id === workout.id) {
      this.store.setCurrentWorkout(workout);
      return;
    }

    if (this.store.routineDraft() && this.store.routineDraft()!.id === workout.id) {
      this.store.setRoutineDraft(workout);
      return;
    }

    this.store.updateWorkoutById(workout.id, () => workout);
  }

  saveCompletedWorkout(workout: Workout): void {
    const updatedWorkouts = this.buildUpdatedWorkoutsSnapshot(workout);
    this.store.commitWorkouts(updatedWorkouts);
    this.clearDraftWorkout(workout.id);
  }

  deleteWorkout(workoutId: string): void {
    const workouts = this.store.getWorkouts().filter(w => w.id !== workoutId);
    this.store.commitWorkouts(workouts);
  }

  setCurrentWorkout(workout: Workout | null): void {
    this.store.setCurrentWorkout(workout);
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

  addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
    let createdExercise: Exercise | null = null;

    const updatedWorkout = this.store.updateWorkoutById(workoutId, workout => {
      const exercise: Exercise = {
        id: this.idService.generateId(),
        name: exerciseName,
        sets: []
      };
      createdExercise = exercise;

      return {
        ...workout,
        exercises: [...workout.exercises, exercise]
      };
    });

    if (!updatedWorkout || !createdExercise) {
      throw new Error(`Workout ${workoutId} not found`);
    }

    return createdExercise;
  }

  removeExerciseFromWorkout(workoutId: string, exerciseId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    }));
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, name: newExerciseName } : exercise
      )
    }));
  }

  reorderExercises(workoutId: string, draggedExerciseId: string, targetExerciseId: string): void {
    this.store.updateWorkoutById(workoutId, workout => {
      const exercises = [...workout.exercises];
      const draggedIndex = exercises.findIndex(e => e.id === draggedExerciseId);
      const targetIndex = exercises.findIndex(e => e.id === targetExerciseId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return workout;
      }

      const [draggedExercise] = exercises.splice(draggedIndex, 1);
      exercises.splice(targetIndex, 0, draggedExercise);

      return { ...workout, exercises };
    });
  }

  addSetToExercise(workoutId: string, exerciseId: string): WorkoutSet {
    let createdSet: WorkoutSet | null = null;

    const updatedWorkout = this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const newSet: WorkoutSet = {
          id: this.idService.generateId(),
          reps: 0,
          weight: 0,
          completed: false
        };

        createdSet = newSet;

        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
      })
    }));

    if (!updatedWorkout || !createdSet) {
      throw new Error(`Workout ${workoutId} or exercise ${exerciseId} not found`);
    }

    return createdSet;
  }

  updateSet(workoutId: string, exerciseId: string, set: WorkoutSet): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(existingSet =>
                existingSet.id === set.id ? set : existingSet
              )
            }
          : exercise
      )
    }));
  }

  removeSetFromExercise(workoutId: string, exerciseId: string, setId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(existingSet => existingSet.id !== setId)
            }
          : exercise
      )
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

  getCurrentWorkoutSnapshot(): Workout | null {
    return this.currentWorkout();
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

  private clearDraftWorkout(workoutId: string): void {
    if (this.store.currentWorkout()?.id === workoutId) {
      this.store.setCurrentWorkout(null);
    }

    if (this.store.routineDraft()?.id === workoutId) {
      this.store.setRoutineDraft(null);
    }
  }
}
