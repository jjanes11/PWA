import { Injectable, Signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { DataStoreService } from './data-store.service';
import { WorkoutSessionService } from './workout-session.service';
import { generateId } from '../utils/id-generator';

/**
 * High-level service for routine management.
 * Provides business logic for routine operations and delegates persistence to DataStoreService.
 */
@Injectable({ providedIn: 'root' })
export class RoutineService {
  constructor(
    private readonly store: DataStoreService,
    private readonly session: WorkoutSessionService
  ) {}

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

  startWorkoutFromRoutine(routine: Routine): Workout {
    return this.session.createWorkoutFromRoutine(routine);
  }

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
