import { signal, Signal } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { Workout } from '../models/workout.models';

export interface SetTypeMenuMixin {
  showSetTypeMenu: Signal<boolean>;
  selectedSet: Signal<{ exerciseId: string; setId: string } | null>;
  openSetTypeMenu(exerciseId: string, setId: string, event: Event): void;
  closeSetTypeMenu(): void;
  setSetType(type: 'normal' | 'warmup' | 'failure' | 'drop'): void;
  removeSet(): void;
  getSetTypeDisplay(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string;
  getSetTypeClass(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string;
}

export function createSetTypeMenuMixin(
  workoutService: WorkoutService,
  getCurrentWorkout: () => Workout | null,
  getWorkoutId: () => string | null
) {
  const showSetTypeMenu = signal(false);
  const selectedSet = signal<{ exerciseId: string; setId: string } | null>(null);

  return {
    showSetTypeMenu,
    selectedSet,

    openSetTypeMenu(exerciseId: string, setId: string, event: Event): void {
      event.stopPropagation();
      selectedSet.set({ exerciseId, setId });
      showSetTypeMenu.set(true);
    },

    closeSetTypeMenu(): void {
      showSetTypeMenu.set(false);
      selectedSet.set(null);
    },

    setSetType(type: 'normal' | 'warmup' | 'failure' | 'drop'): void {
      const selected = selectedSet();
      const workout = getCurrentWorkout();
      const workoutId = getWorkoutId();
      
      if (selected && workout && workoutId) {
        const exercise = workout.exercises.find(e => e.id === selected.exerciseId);
        const set = exercise?.sets.find(s => s.id === selected.setId);
        
        if (set) {
          const updatedSet = { ...set, type };
          workoutService.updateSet(workoutId, selected.exerciseId, updatedSet);
        }
      }
      
      showSetTypeMenu.set(false);
      selectedSet.set(null);
    },

    removeSet(): void {
      const selected = selectedSet();
      const workout = getCurrentWorkout();
      const workoutId = getWorkoutId();
      
      if (selected && workout && workoutId) {
        workoutService.removeSetFromExercise(workoutId, selected.exerciseId, selected.setId);
      }
      
      showSetTypeMenu.set(false);
      selectedSet.set(null);
    },

    getSetTypeDisplay(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string {
      if (!type || type === 'normal') return '';
      if (type === 'warmup') return 'W';
      if (type === 'failure') return 'F';
      if (type === 'drop') return 'D';
      return '';
    },

    getSetTypeClass(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string {
      if (!type || type === 'normal') return '';
      return `jacaona-set-type-${type}`;
    }
  };
}
