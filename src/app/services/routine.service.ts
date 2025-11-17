import { Injectable, Signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { DataStoreService } from './data-store.service';
import { RoutineDraftService } from './routine-draft.service';
import { WorkoutService } from './workout.service';
import { generateId } from '../utils/id-generator';
import { createBaseWorkout, cloneWorkoutForDraft } from '../utils/workout-entity.utils';

/**
 * Facade for routine management.
 * Handles routine CRUD, routine drafts, and workout-to-routine conversions.
 */
@Injectable({ providedIn: 'root' })
export class RoutineService {
  constructor(
    private readonly store: DataStoreService,
    private readonly routineDraftService: RoutineDraftService,
    private readonly workoutService: WorkoutService
  ) {}

  // Routine list access
  routinesSignal(): Signal<Routine[]> {
    return this.store.routinesSignal();
  }

  get routines() {
    return this.store.routinesSignal();
  }

  listRoutines(): Routine[] {
    return this.store.listRoutines();
  }

  findRoutineById(routineId: string): Routine | null {
    return this.store.findRoutineById(routineId);
  }

  // Routine draft access
  get routineDraft(): Signal<Workout | null> {
    return this.routineDraftService.routineDraftSignal();
  }

  getRoutineDraft(): Workout | null {
    return this.routineDraftService.getRoutineDraft();
  }

  // Create routine drafts
  createRoutineDraft(name: string = 'New Routine'): Workout {
    const draft = createBaseWorkout(name);
    this.routineDraftService.setRoutineDraft(draft);
    return draft;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.workoutService.findWorkoutById(workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const draft = cloneWorkoutForDraft(sourceWorkout);
    this.routineDraftService.setRoutineDraft(draft);
    return draft;
  }

  setRoutineDraft(draft: Workout | null): void {
    this.routineDraftService.setRoutineDraft(draft);
  }

  clearRoutineDraft(): void {
    this.routineDraftService.clearRoutineDraft();
  }

  // Start workout from routine
  startWorkoutFromRoutine(routine: Routine): Workout {
    return this.workoutService.createWorkoutFromRoutine(routine);
  }

  // Save routine from workout
  saveFromWorkout(workout: Workout): Routine {
    const routine: Routine = {
      id: generateId(),
      name: workout.name,
      exercises: workout.exercises.map(exercise => ({
        id: generateId(),
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          type: set.type
        }))
      }))
    };

    this.store.saveRoutine(routine);
    return routine;
  }

  saveRoutine(routine: Routine): void {
    this.store.saveRoutine(routine);
  }

  updateRoutine(routine: Routine): Routine | null {
    return this.store.updateRoutine(routine.id, () => routine);
  }

  deleteRoutine(routineId: string): void {
    this.store.deleteRoutine(routineId);
  }

  reorderRoutines(fromId: string, toId: string): void {
    const routines = [...this.store.listRoutines()];
    const fromIndex = routines.findIndex(r => r.id === fromId);
    const toIndex = routines.findIndex(r => r.id === toId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [moved] = routines.splice(fromIndex, 1);
    routines.splice(toIndex, 0, moved);
    this.store.replaceAllRoutines(routines);
  }
}
