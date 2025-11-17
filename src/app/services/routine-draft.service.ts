import { Injectable, Signal, signal, inject } from '@angular/core';
import { Workout } from '../models/workout.models';
import { createBaseWorkout, cloneWorkoutForDraft } from '../utils/workout-entity.utils';

/**
 * Manages routine draft state (unsaved routine template being created/edited).
 * This is transient state - not persisted until explicitly saved as a routine.
 */
@Injectable({ providedIn: 'root' })
export class RoutineDraftService {
  private readonly routineDraft = signal<Workout | null>(null);

  routineDraftSignal(): Signal<Workout | null> {
    return this.routineDraft.asReadonly();
  }

  getRoutineDraft(): Workout | null {
    return this.routineDraft();
  }

  setRoutineDraft(draft: Workout | null): void {
    this.routineDraft.set(draft);
  }

  clearRoutineDraft(): void {
    this.routineDraft.set(null);
  }

  // Create new routine draft
  createDraft(name: string = 'New Routine'): Workout {
    const draft = createBaseWorkout(name);
    this.setRoutineDraft(draft);
    return draft;
  }

  // Create draft from existing workout
  createDraftFromWorkout(sourceWorkout: Workout): Workout {
    const draft = cloneWorkoutForDraft(sourceWorkout);
    this.setRoutineDraft(draft);
    return draft;
  }
}
