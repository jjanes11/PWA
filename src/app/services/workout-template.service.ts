import { Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { RoutinePersistenceService } from './routine-persistence.service';
import { WorkoutSessionService } from './workout-session.service';
import { generateId } from '../utils/id-generator';

/**
 * High-level service for routine management.
 * Coordinates routine operations through persistence service.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutRoutineService {
  get routines() {
    return this.routinePersistence.routinesSignal();
  }

  constructor(
    private readonly routinePersistence: RoutinePersistenceService,
    private readonly session: WorkoutSessionService
  ) {}

  getRoutines(): Routine[] {
    return this.routinePersistence.listRoutines();
  }

  findRoutineById(routineId: string): Routine | undefined {
    return this.routinePersistence.findRoutineById(routineId) ?? undefined;
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

    this.routinePersistence.saveRoutine(routine);
    return routine;
  }

  saveRoutineDirectly(routine: Routine): void {
    this.routinePersistence.saveRoutine(routine);
  }

  updateRoutine(routine: Routine): Routine | null {
    return this.routinePersistence.updateRoutine(routine.id, () => routine);
  }

  deleteRoutine(routineId: string): void {
    this.routinePersistence.deleteRoutine(routineId);
  }

  reorderRoutines(fromId: string, toId: string): void {
    const routines = [...this.routinePersistence.listRoutines()];
    const fromIndex = routines.findIndex(r => r.id === fromId);
    const toIndex = routines.findIndex(r => r.id === toId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [moved] = routines.splice(fromIndex, 1);
    routines.splice(toIndex, 0, moved);
    this.routinePersistence.replaceAllRoutines(routines);
  }
}
