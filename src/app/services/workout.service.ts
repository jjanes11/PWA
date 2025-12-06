import { Injectable, Signal } from '@angular/core';
import { Workout, Routine, WorkoutStats, Exercise, WorkoutEntity } from '../models/workout.models';
import { DataStoreService } from './data-store.service';
import { ActiveWorkoutService } from './active-workout.service';
import { RoutineDraftService } from './routine-draft.service';
import { WorkoutStatsService } from './workout-stats.service';
import { WorkoutEditorService } from './workout-editor.service';
import { createBaseWorkout, workoutFromTemplate, cloneWorkoutForDraft } from '../utils/workout-entity.utils';

/**
 * Main facade for workout operations.
 * Coordinates persistence, active workout state, and workout editing.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutService {
  constructor(
    private readonly store: DataStoreService,
    private readonly activeWorkoutService: ActiveWorkoutService,
    private readonly statsService: WorkoutStatsService,
    private readonly editor: WorkoutEditorService
  ) {}

  // Workout list access
  workoutsSignal(): Signal<Workout[]> {
    return this.store.workoutsSignal();
  }

  // Stats
  statsSignal(): Signal<WorkoutStats> {
    return this.statsService.statsSignal;
  }

  // Active workout access
  activeWorkoutSignal(): Signal<Workout | null> {
    return this.activeWorkoutService.activeWorkoutSignal();
  }

  getActiveWorkout(): Workout | null {
    return this.activeWorkoutService.getActiveWorkout();
  }

  hasActiveWorkout(): boolean {
    return this.activeWorkoutService.hasActiveWorkout();
  }

  // Create new workouts
  createWorkout(name: string): Workout {
    const workout = createBaseWorkout(name);
    this.activeWorkoutService.setActiveWorkout(workout);
    return workout;
  }

  createWorkoutFromRoutine(routine: Routine): Workout {
    const workout = workoutFromTemplate(routine);
    this.activeWorkoutService.setActiveWorkout(workout);
    return workout;
  }

  // Update active workout
  updateActiveWorkout(workout: Workout): void {
    this.activeWorkoutService.updateActiveWorkout(workout);
  }

  clearActiveWorkout(): void {
    this.activeWorkoutService.clearActiveWorkout();
  }

  // Find workout (checks active first, then persisted)
  findWorkoutById(workoutId: string): Workout | null {
    const active = this.activeWorkoutService.getActiveWorkout();
    if (active?.id === workoutId) {
      return active;
    }
    return this.store.findWorkoutById(workoutId);
  }

  // Persistence operations
  saveWorkout(workout: Workout): void {
    this.store.saveWorkout(workout);
  }

  finishWorkout(workout: Workout): void {
    const completed = {
      ...workout,
      completed: true
    };
    
    this.store.saveWorkout(completed);
    
    if (this.activeWorkoutService.getActiveWorkout()?.id === workout.id) {
      this.activeWorkoutService.clearActiveWorkout();
    }
  }

  deleteWorkout(workoutId: string): void {
    this.store.deleteWorkout(workoutId);
    if (this.activeWorkoutService.getActiveWorkout()?.id === workoutId) {
      this.activeWorkoutService.clearActiveWorkout();
    }
  }

  // Workout editing with WorkoutEditorService
  addExercisesToWorkout<T extends WorkoutEntity>(
    workout: T,
    exerciseNames: string[],
    defaultSetCount: number
  ): { workout: T; exercises: Exercise[] } {
    const createdExercises: Exercise[] = [];
    let updatedWorkout = workout;

    exerciseNames.forEach(name => {
      const result = this.editor.addExerciseToWorkout(updatedWorkout, name);
      updatedWorkout = this.editor.addDefaultSets(result.workout, result.exercise.id, defaultSetCount);
      createdExercises.push(result.exercise);
    });

    return { workout: updatedWorkout, exercises: createdExercises };
  }

  replaceExercise<T extends WorkoutEntity>(
    workout: T,
    exerciseId: string,
    newExerciseName: string
  ): T {
    return this.editor.replaceExerciseInWorkout(workout, exerciseId, newExerciseName);
  }
}
