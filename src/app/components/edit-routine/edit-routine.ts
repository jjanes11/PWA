import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Routine, WorkoutSource } from '../../models/workout.models';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { RoutineService } from '../../services/routine.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { ExerciseListEditorComponent, EditorButtonConfig, BottomButtonConfig, ExerciseListEditorEmptyState } from '../exercise-list-editor/exercise-list-editor';
import { MenuItem } from '../card-menu/card-menu';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useCleanupContext } from '../../utils/navigation-context';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutEditor = inject(WorkoutEditorService);
  private routineService = inject(RoutineService);
  private cleanup = useCleanupContext();
  
  // Get routine ID from route params
  private routineId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );
  
  routine = signal<Routine | null>(null);
  title = signal('');

  constructor() {
    // Load routine when ID changes
    effect(() => {
      const id = this.routineId();
      if (!id) {
        this.router.navigate(['/workouts']);
        return;
      }

      const routine = this.routineService.findRoutineById(id);
      if (!routine) {
        // Routine was deleted, redirect
        this.router.navigate(['/workouts']);
        return;
      }

      this.routine.set(routine);
      this.title.set(routine.name);
    });
  }
  
  private exerciseCardController = useExerciseCardController<Routine>(this.workoutEditor, {
    getWorkout: () => this.routine(),
    onWorkoutUpdated: (updatedRoutine) => {
      this.routine.set(updatedRoutine);
      this.routineService.saveRoutine(updatedRoutine);
    },
    onReplaceExercise: (exerciseId: string) => {
      const routine = this.routine();
      if (routine) {
        this.router.navigate(['/add-exercise'], {
          queryParams: {
            workoutId: routine.id,
            source: WorkoutSource.PersistedRoutine,
            replaceExerciseId: exerciseId,
            returnUrl: this.router.url
          }
        });
      }
    }
  });

  draggedExerciseId = signal<string | null>(null);
  dragOverExerciseId = signal<string | null>(null);

  menuItems: MenuItem[] = [
    {
      action: 'replace',
      icon: 'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z',
      text: 'Replace Exercise'
    },
    {
      action: 'remove',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      text: 'Remove Exercise',
      danger: true
    }
  ];

  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;
  headerLeftButton: EditorButtonConfig = {
    label: 'Cancel',
    variant: 'ghost'
  };

  headerRightButton: EditorButtonConfig = {
    label: 'Update'
  };

  bottomPrimaryButton: BottomButtonConfig = {
    label: '+ Add exercise',
    variant: 'secondary'
  };

  emptyState: ExerciseListEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add exercises to update this routine.'
  };

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onRoutineUpdated(routine: Routine): void {
    this.routine.set(routine);
    this.routineService.saveRoutine(routine);
  }

  cancel(): void {
    this.router.navigate(['/workouts']);
  }

  update(): void {
    const routine = this.routine();
    if (routine) {
      // Update the routine with current title
      const updatedRoutine: Routine = {
        ...routine,
        name: this.title().trim() || 'Untitled Routine'
      };
      
      this.routineService.saveRoutine(updatedRoutine);
      this.router.navigate(['/workouts']);
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    const routine = this.routine();
    if (routine) {
      this.router.navigate(['/add-exercise'], {
        queryParams: {
          workoutId: routine.id,
          source: WorkoutSource.PersistedRoutine,
          returnUrl: this.router.url
        }
      });
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const routine = this.routine();
    if (!routine) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }

  onExerciseReorder(event: DragReorderEvent): void {
    const routine = this.routine();
    if (!routine) return;

    const reordered = this.workoutEditor.reorderExercises(routine, event.fromId, event.toId);
    this.routine.set(reordered);
    this.routineService.saveRoutine(reordered);
  }
}
