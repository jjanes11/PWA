import { Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';
import { WorkoutSessionService } from './workout-session.service';
import { IdService } from './id.service';

@Injectable({ providedIn: 'root' })
export class WorkoutRoutineService {
  get routines() {
    return this.store.routines;
  }

  constructor(
    private readonly store: WorkoutStoreService,
    private readonly session: WorkoutSessionService,
    private readonly idService: IdService
  ) {}

  getRoutines(): Routine[] {
    return this.store.getRoutines();
  }

  findRoutineById(routineId: string): Routine | undefined {
    return this.store.getRoutines().find(routine => routine.id === routineId);
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

    const routines = [...this.store.getRoutines(), routine];
    this.store.commitRoutines(routines);
    return routine;
  }

  saveRoutineDirectly(routine: Routine): void {
    const routines = [...this.store.getRoutines(), routine];
    this.store.commitRoutines(routines);
  }

  updateRoutine(routine: Routine): Routine | null {
    return this.store.updateRoutineById(routine.id, () => routine);
  }

  deleteRoutine(routineId: string): void {
    const routines = this.store.getRoutines().filter(r => r.id !== routineId);
    this.store.commitRoutines(routines);
  }

  reorderRoutines(fromId: string, toId: string): void {
    const routines = [...this.store.getRoutines()];
    const fromIndex = routines.findIndex(r => r.id === fromId);
    const toIndex = routines.findIndex(r => r.id === toId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [moved] = routines.splice(fromIndex, 1);
    routines.splice(toIndex, 0, moved);
    this.store.commitRoutines(routines);
  }
}
