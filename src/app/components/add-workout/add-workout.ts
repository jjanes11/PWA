import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Workout, Routine, WorkoutSource } from '../../models/workout.models';
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
  
  private exerciseCardController = useExerciseCardController(this.workoutEditor, {
    getWorkout: () => this.activeWorkout(),
    onWorkoutUpdated: (workout) => {
      // Only workouts can be active, not routines
      if ('date' in workout) {
        this.activeWorkoutService.setActiveWorkout(workout);
      }
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
  dragOverExerciseId = signal<string | null>(null);

  headerLeftButton: EditorButtonConfig = {
    variant: 'icon',
    ariaLabel: 'Back',
    iconPath: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20z'
  };

  headerRightButton: EditorButtonConfig = {
    label: 'Finish'
  };

  bottomPrimaryButton: BottomButtonConfig = {
    label: 'Add Exercise',
    variant: 'primary'
  };

  bottomSecondaryButton: BottomButtonConfig = {
    label: 'Discard Workout',
    variant: 'danger'
  };

  emptyState: ExerciseListEditorEmptyState = {
    iconPath: 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',
    title: 'Get started',
    message: 'Add your first exercise to build this workout.'
  };
  
  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onWorkoutUpdated(workout: Workout | Routine): void {
    this.activeWorkoutService.setActiveWorkout(workout as Workout);
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
