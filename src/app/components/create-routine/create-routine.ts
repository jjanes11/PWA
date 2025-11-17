import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutSessionService } from '../../services/workout-session.service';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { WorkoutRoutineService } from '../../services/workout-template.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { setupEditorContext } from '../../utils/editor-context';
import { useWorkoutActions } from '../../utils/workout-actions';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog, SetTypeMenuComponent, WorkoutEditorComponent],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private workoutSession = inject(WorkoutSessionService);
  private workoutEditor = inject(WorkoutEditorService);
  private workoutRoutineService = inject(WorkoutRoutineService);
  private editorContext = setupEditorContext({
    kind: 'draft',
    defaultOrigin: '/workouts',
    discardConfig: {
      message: 'Are you sure you want to discard the routine?',
      confirmText: 'Discard Routine',
      onConfirm: () => this.handleDiscardConfirm()
    }
  });
  private workoutContext = this.editorContext.workoutContext;
  routineDraft = this.workoutContext.workout; // Use routineDraft signal from context
  private exerciseCardController = useExerciseCardController(this.workoutEditor, {
    getWorkout: () => this.workoutContext.workout()
  });
  title: string = '';
  private sourceWorkoutId: string | null = null;
  private navigationContext = this.editorContext.navigation;
  discardGuard = this.editorContext.discard!;
  private workoutActions = useWorkoutActions({ editorContext: this.editorContext });
  headerLeftButton: EditorButtonConfig = {
    label: 'Cancel',
    variant: 'ghost'
  };

  headerRightButton: EditorButtonConfig = {
    label: 'Save'
  };

  bottomPrimaryButton: BottomButtonConfig = {
    label: '+ Add exercise',
    variant: 'primary'
  };

  emptyState: WorkoutEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add exercises to build your routine.'
  };
  
  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  constructor() {}

  ngOnInit(): void {
    // If we have a source workout ID, create a draft from it
    if (this.sourceWorkoutId) {
      const draftWorkout = this.workoutSession.createDraftFromWorkout(this.sourceWorkoutId);
      if (draftWorkout) {
        this.workoutContext.setWorkout(draftWorkout);
        this.title = draftWorkout.name || '';
        return;
      }
    }

    const draftWorkout = this.workoutContext.ensureFresh(() => this.workoutSession.createRoutineDraft('New Routine'));
    if (draftWorkout) {
      this.title = draftWorkout.name || '';
    }
  }

  cancel(): void {
    this.workoutActions.discardWorkout();
  }

  save(): void {
    const workout = this.routineDraft();
    if (workout) {
      // Create updated workout with the user's title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      // Update workout via shared actions
      this.workoutActions.saveWorkout(updatedWorkout);

      // Save as template for routines
      this.workoutRoutineService.saveFromWorkout(updatedWorkout);

      this.navigationContext.exit();
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Update draft title before navigating
    const workout = this.routineDraft();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutSession.updateDraft(updatedWorkout);
    }
    
    // Navigate to add-exercise and return to this page after adding
    this.navigationContext.navigateWithReturn('/add-exercise');
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }

  private handleDiscardConfirm(): void {
    this.navigationContext.exit();
  }
}
