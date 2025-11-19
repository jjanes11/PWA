import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Workout, WorkoutSource } from '../../models/workout.models';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { WorkoutUiService } from '../../services/workout-ui.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { MenuItem } from '../card-menu/card-menu';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { ExerciseListEditorComponent, BottomButtonConfig, EditorButtonConfig, ExerciseListEditorEmptyState } from '../exercise-list-editor/exercise-list-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useDiscardGuard } from '../../utils/discard-guard';
import { useCleanupContext } from '../../utils/navigation-context';
import { EditorButtons, MenuIcons, EmptyStates } from '../../utils/editor-button-configs';

@Component({
  selector: 'app-add-workout',
  imports: [CommonModule, ConfirmationDialog, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css'
})
export class AddWorkoutComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private activeWorkoutService = inject(ActiveWorkoutService);
  private workoutEditor = inject(WorkoutEditorService);
  private uiService = inject(WorkoutUiService);
  private router = inject(Router);
  
  activeWorkout = this.activeWorkoutService.activeWorkoutSignal();
  
  private cleanup = useCleanupContext({
    cleanup: () => {
      const workout = this.activeWorkout();
      if (workout) {
        this.workoutService.deleteWorkout(workout.id);
        this.activeWorkoutService.clearActiveWorkout();
      }
    }
  });
  
  discardGuard = useDiscardGuard({
    message: 'Are you sure you want to discard this workout?',
    confirmText: 'Discard Workout',
    onConfirm: () => this.handleDiscardConfirm()
  });
  
  private exerciseCardController = useExerciseCardController<Workout>(this.workoutEditor, {
    getWorkout: () => this.activeWorkout(),
    onWorkoutUpdated: (workout) => {
      this.activeWorkoutService.setActiveWorkout(workout);
    },
    onReplaceExercise: (exerciseId: string) => {
      const workout = this.activeWorkout();
      if (workout) {
        this.router.navigate(['/add-exercise'], {
          queryParams: {
            workoutId: workout.id,
            source: WorkoutSource.ActiveWorkout,
            replaceExerciseId: exerciseId,
            returnUrl: this.router.url
          }
        });
      }
    }
  });
  
  draggedExerciseId = signal<string | null>(null);
  
  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;

  menuItems: MenuItem[] = [
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
  dragOverExerciseId = signal<string | null>(null);

  headerLeftButton = EditorButtons.back();
  headerRightButton = EditorButtons.finish();
  bottomPrimaryButton = EditorButtons.addExercise('primary');
  bottomSecondaryButton = EditorButtons.discardWorkout();

  emptyState = EmptyStates.addWorkout();
  
  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onWorkoutUpdated(workout: Workout): void {
    this.activeWorkoutService.setActiveWorkout(workout);
  }

  ngOnInit(): void {
    // Create a new workout if none exists
    if (!this.activeWorkout()) {
      const newWorkout = this.workoutService.createWorkout('New Workout');
      this.activeWorkoutService.setActiveWorkout(newWorkout);
    }
  }

  goBack(): void {
    const workout = this.activeWorkout();
    // Only show dialog if workout has exercises
    if (workout && workout.exercises.length > 0) {
      this.uiService.showWorkoutInProgressDialog();
      this.router.navigate(['/workouts']);
    } else {
      // No exercises, perform cleanup and navigate back
      this.cleanup.performCleanup();
      this.router.navigate(['/workouts']);
    }
  }

  finishWorkout(): void {
    const workout = this.activeWorkout();
    if (workout && workout.exercises.length > 0) {
      // Navigate to save workout page if there are exercises
      this.router.navigate(['/save-workout']);
    } else {
      // If no exercises, just go back
      this.cleanup.performCleanup();
      this.router.navigate(['/workouts']);
    }
  }

  addExercise(): void {
    const workout = this.activeWorkout();
    if (workout) {
      this.router.navigate(['/add-exercise'], {
        queryParams: {
          workoutId: workout.id,
          source: WorkoutSource.ActiveWorkout,
          returnUrl: this.router.url
        }
      });
    }
  }

  discardWorkout(): void {
    this.discardGuard.open();
  }

  onExerciseReorder(event: DragReorderEvent): void {
    const workout = this.activeWorkout();
    if (workout) {
      const updatedWorkout = this.workoutEditor.reorderExercises(workout, event.fromId, event.toId);
      this.workoutService.updateActiveWorkout(updatedWorkout);
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    if (!this.activeWorkout()) {
      return;
    }

    this.exerciseCardController.handleAction(event);
  }

  private handleDiscardConfirm(): void {
    this.cleanup.performCleanup();
    this.router.navigate(['/workouts']);
  }
}
