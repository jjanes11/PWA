import { Injectable, Signal, signal } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { generateId } from '../utils/id-generator';

/**
 * Manages routine draft state (unsaved routine template being created/edited).
 * This is transient state - not persisted until explicitly saved as a routine.
 */
@Injectable({ providedIn: 'root' })
export class RoutineDraftService {
  private readonly routineDraft = signal<Routine | null>(null);

  routineDraftSignal(): Signal<Routine | null> {
    return this.routineDraft.asReadonly();
  }

  getRoutineDraft(): Routine | null {
    return this.routineDraft();
  }

  setRoutineDraft(draft: Routine | null): void {
    this.routineDraft.set(draft);
  }

  clearRoutineDraft(): void {
    this.routineDraft.set(null);
  }

  // Create new routine draft
  createDraft(name: string = 'New Routine'): Routine {
    const draft: Routine = {
      id: generateId(),
      name,
      exercises: []
    };
    this.setRoutineDraft(draft);
    return draft;
  }

  // Create draft from existing workout (copy exercises structure)
  createDraftFromWorkout(sourceWorkout: Workout): Routine {
    const draft: Routine = {
      id: generateId(),
      name: sourceWorkout.name,
      exercises: sourceWorkout.exercises.map(exercise => ({
        id: generateId(),
        name: exercise.name,
        equipment: exercise.equipment,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        otherMuscles: exercise.otherMuscles,
        exerciseType: exercise.exerciseType,
        sets: exercise.sets.map(set => ({
          id: generateId(),
          reps: set.reps,
          weight: set.weight,
          completed: false,
          type: set.type,
          restTime: set.restTime,
          notes: set.notes
        }))
      }))
    };
    this.setRoutineDraft(draft);
    return draft;
  }
}
