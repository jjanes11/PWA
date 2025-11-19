import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Workout, WorkoutSource } from '../../models/workout.models';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { WorkoutUiService } from '../../services/workout-ui.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { ExerciseListEditorComponent } from '../exercise-list-editor/exercise-list-editor';
import { useDiscardGuard } from '../../utils/discard-guard';
import { useCleanupContext } from '../../utils/navigation-context';
import { EditorButtons, EmptyStates } from '../../utils/editor-button-configs';
import { useWorkoutEntityEditor } from '../../utils/workout-entity-editor';

@Component({
  selector: 'app-add-workout',
  imports: [CommonModule, ConfirmationDialog, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css'
})
export class AddWorkoutComponent {
  private workoutService = inject(WorkoutService);
  private activeWorkoutService = inject(ActiveWorkoutService);
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
  
  // Entity editor provides all exercise editing functionality
  private entityEditor = useWorkoutEntityEditor<Workout>({
    getEntity: () => this.activeWorkout(),
    onEntityUpdated: (workout) => this.activeWorkoutService.setActiveWorkout(workout),
    source: WorkoutSource.ActiveWorkout
  });
  
  // Expose editor properties for template
  draggedExerciseId = this.entityEditor.draggedExerciseId;
  dragOverExerciseId = this.entityEditor.dragOverExerciseId;
  menuItems = this.entityEditor.menuItems;
  showSetTypeMenu = this.entityEditor.showSetTypeMenu;
  selectedSet = this.entityEditor.selectedSet;

  headerLeftButton = EditorButtons.back();
  headerRightButton = EditorButtons.finish();
  bottomPrimaryButton = EditorButtons.addExercise('primary');
  bottomSecondaryButton = EditorButtons.discardWorkout();

  emptyState = EmptyStates.addWorkout();
  
  closeSetTypeMenu(): void {
    this.entityEditor.closeSetTypeMenu();
  }

  onWorkoutUpdated(workout: Workout): void {
    this.entityEditor.onEntityUpdated(workout);
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
    this.entityEditor.navigateToAddExercise();
  }

  discardWorkout(): void {
    this.discardGuard.open();
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  private handleDiscardConfirm(): void {
    this.cleanup.performCleanup();
    this.router.navigate(['/workouts']);
  }
}
