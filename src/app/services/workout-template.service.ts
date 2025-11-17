import { Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';
import { WorkoutSessionService } from './workout-session.service';
import { IdService } from './id.service';

@Injectable({ providedIn: 'root' })
export class WorkoutRoutineService {
  get routines() {
    return this.store.routinesSignal();
  }

  constructor(
    private readonly store: WorkoutStoreService,
    private readonly session: WorkoutSessionService,
    private readonly idService: IdService
  ) {}

  getRoutines(): Routine[] {
    return this.store.listRoutines();
  }

  findRoutineById(routineId: string): Routine | undefined {
    return this.store.findRoutineById(routineId) ?? undefined;
  }

  startWorkoutFromRoutine(routine: Routine): Workout {
    return this.session.createWorkoutFromRoutine(routine);
  }

  saveFromWorkout(workout: Workout): Routine {
    const routine: Routine = {
      id: this.idService.generateId(),
      name: workout.name,
      exercises: workout.exercises.map(exercise => ({
        id: this.idService.generateId(),
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

  saveRoutineDirectly(routine: Routine): void {
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
