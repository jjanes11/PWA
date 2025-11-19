import { inject, signal, Signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutEditorService } from '../services/workout-editor.service';
import { WorkoutEntity, WorkoutSource } from '../models/workout.models';
import { MenuItem } from '../components/card-menu/card-menu';
import { DragReorderEvent } from '../directives/draggable.directive';
import { ExerciseActionEvent } from '../components/exercise-card/exercise-card';
import { useExerciseCardController } from './exercise-card-controller';
import { MenuIcons } from './editor-button-configs';

/**
 * Configuration for the workout entity editor composition function.
 */
export interface WorkoutEntityEditorConfig<T extends WorkoutEntity> {
  /** Function to get the current entity being edited */
  getEntity: () => T | null;
  
  /** Callback when entity is updated */
  onEntityUpdated: (entity: T) => void;
  
  /** Source type for this entity (determines navigation/persistence behavior) */
  source: WorkoutSource;
  
  /** Optional: Custom menu items (defaults to replace/remove) */
  menuItems?: MenuItem[];
}

/**
 * Return type for the workout entity editor composition function.
 * Provides all necessary state and handlers for entity editing UI.
 */
export interface WorkoutEntityEditorResult<T extends WorkoutEntity> {
  /** Signal for tracking currently dragged exercise ID */
  draggedExerciseId: WritableSignal<string | null>;
  
  /** Signal for tracking exercise being dragged over */
  dragOverExerciseId: WritableSignal<string | null>;
  
  /** Menu items for exercise card actions */
  menuItems: MenuItem[];
  
  /** Handler for exercise card actions (add set, remove set, etc.) */
  onExerciseAction: (event: ExerciseActionEvent) => boolean;
  
  /** Handler for exercise reordering via drag and drop */
  onExerciseReorder: (event: DragReorderEvent) => void;
  
  /** Navigate to add-exercise page with proper context */
  navigateToAddExercise: () => void;
  
  /** Signal indicating if set type menu is visible */
  showSetTypeMenu: Signal<boolean>;
  
  /** Signal with current selected set info (exerciseId, setId) */
  selectedSet: Signal<{ exerciseId: string; setId: string } | null>;
  
  /** Close the set type menu */
  closeSetTypeMenu: () => void;
  
  /** Update the entity with set type menu changes */
  onEntityUpdated: (entity: T) => void;
}

/**
 * Composition function that provides all common logic for workout/routine editing.
 * Consolidates drag-and-drop, menu actions, exercise management, and navigation.
 * 
 * @example
 * ```typescript
 * const editor = useWorkoutEntityEditor<Workout>({
 *   getEntity: () => this.workout(),
 *   onEntityUpdated: (w) => this.workoutService.save(w),
 *   source: WorkoutSource.PersistedWorkout
 * });
 * 
 * // Use in template bindings
 * [menuItems]="editor.menuItems"
 * (exerciseAction)="editor.onExerciseAction($event)"
 * ```
 */
export function useWorkoutEntityEditor<T extends WorkoutEntity>(
  config: WorkoutEntityEditorConfig<T>
): WorkoutEntityEditorResult<T> {
  const router = inject(Router);
  const workoutEditor = inject(WorkoutEditorService);
  
  // Drag and drop state
  const draggedExerciseId = signal<string | null>(null);
  const dragOverExerciseId = signal<string | null>(null);
  
  // Default menu items (can be overridden via config)
  const menuItems: MenuItem[] = config.menuItems ?? [
    {
      action: 'replace',
      icon: MenuIcons.replace,
      text: 'Replace Exercise'
    },
    {
      action: 'remove',
      icon: MenuIcons.remove,
      text: 'Remove Exercise',
      danger: true
    }
  ];
  
  // Exercise card controller for handling set operations
  const exerciseCardController = useExerciseCardController<T>(workoutEditor, {
    getWorkout: config.getEntity,
    onWorkoutUpdated: config.onEntityUpdated,
    onReplaceExercise: (exerciseId: string) => {
      const entity = config.getEntity();
      if (entity) {
        router.navigate(['/add-exercise'], {
          queryParams: {
            workoutId: entity.id,
            source: config.source,
            replaceExerciseId: exerciseId,
            returnUrl: router.url
          }
        });
      }
    }
  });
  
  // Exercise reordering handler
  const onExerciseReorder = (event: DragReorderEvent): void => {
    const entity = config.getEntity();
    if (!entity) return;
    
    const reordered = workoutEditor.reorderExercises(entity, event.fromId, event.toId);
    config.onEntityUpdated(reordered);
  };
  
  // Navigate to add-exercise page
  const navigateToAddExercise = (): void => {
    const entity = config.getEntity();
    if (!entity) return;
    
    router.navigate(['/add-exercise'], {
      queryParams: {
        workoutId: entity.id,
        source: config.source,
        returnUrl: router.url
      }
    });
  };
  
  return {
    draggedExerciseId,
    dragOverExerciseId,
    menuItems,
    onExerciseAction: (event: ExerciseActionEvent) => 
      exerciseCardController.handleAction(event),
    onExerciseReorder,
    navigateToAddExercise,
    showSetTypeMenu: exerciseCardController.showSetTypeMenu,
    selectedSet: exerciseCardController.selectedSet,
    closeSetTypeMenu: () => exerciseCardController.closeSetTypeMenu(),
    onEntityUpdated: config.onEntityUpdated
  };
}
