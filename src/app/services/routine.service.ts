import { Injectable, Signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { DataStoreService } from './data-store.service';
import { RoutineDraftService } from './routine-draft.service';
import { WorkoutService } from './workout.service';
import { generateId } from '../utils/id-generator';

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

  findRoutineById(routineId: string): Routine | null {
    return this.store.findRoutineById(routineId);
  }

  // Routine draft access
  routineDraftSignal(): Signal<Workout | null> {
    return this.routineDraftService.routineDraftSignal();
  }

  getRoutineDraft(): Workout | null {
    return this.routineDraftService.getRoutineDraft();
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
          id: generateId(),
          reps: set.reps,
          weight: set.weight,
          type: set.type,
          completed: false
        }))
      }))
    };

    this.store.saveRoutine(routine);
    this.routineDraftService.clearRoutineDraft();
    return routine;
  }

  saveRoutine(routine: Routine): void {
    this.store.saveRoutine(routine);
  }

  deleteRoutine(routineId: string): void {
    this.store.deleteRoutine(routineId);
  }

  reorderRoutines(fromId: string, toId: string): void {
    const routines = [...this.store.routinesSignal()()];
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
