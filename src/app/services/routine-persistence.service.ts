import { Injectable, Signal } from '@angular/core';
import { Routine } from '../models/workout.models';
import { DataStoreService } from './data-store.service';

/**
 * Handles routine template persistence operations.
 * Encapsulates routine CRUD without exposing repository internals.
 */
@Injectable({ providedIn: 'root' })
export class RoutinePersistenceService {
  constructor(private readonly store: DataStoreService) {}

  routinesSignal(): Signal<Routine[]> {
    return this.store.routinesSignal();
  }

  listRoutines(): Routine[] {
    return this.store.listRoutines();
  }

  findRoutineById(routineId: string): Routine | null {
    return this.store.findRoutineById(routineId);
  }

  saveRoutine(routine: Routine): void {
    this.store.saveRoutine(routine);
  }

  updateRoutine(routineId: string, mutate: (routine: Routine) => Routine): Routine | null {
    return this.store.updateRoutine(routineId, mutate);
  }

  deleteRoutine(routineId: string): void {
    this.store.deleteRoutine(routineId);
  }

  replaceAllRoutines(routines: Routine[]): void {
    this.store.replaceAllRoutines(routines);
  }
}
