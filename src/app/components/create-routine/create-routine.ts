import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { NavigationService } from '../../services/navigation.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useWorkoutContext } from '../../utils/workout-context';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useDiscardGuard } from '../../utils/discard-guard';
import { useNavigationContext } from '../../utils/navigation-context';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog, SetTypeMenuComponent, WorkoutEditorComponent],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);
  private workoutContext = useWorkoutContext('draft');
  routineDraft = this.workoutContext.workout; // Use routineDraft instead of currentWorkout
  private exerciseCardController = useExerciseCardController(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });
  title: string = '';
  private sourceWorkoutId: string | null = null;
  private navigationContext = useNavigationContext({
    defaultOrigin: '/workouts',
    cleanup: () => {
      const workout = this.routineDraft();
      if (workout) {
        this.workoutService.deleteWorkout(workout.id);
        this.workoutContext.setWorkout(null);
      }
    }
  });
  discardGuard = useDiscardGuard({
    message: 'Are you sure you want to discard the routine?',
    confirmText: 'Discard Routine',
    onConfirm: () => this.handleDiscardConfirm()
  });
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

  constructor() {
    // Get return URL and source workout ID from navigation service
    this.sourceWorkoutId = this.navigationService.getSourceWorkoutId();
  }

  ngOnInit(): void {
    // If we have a source workout ID, create a draft from it
    if (this.sourceWorkoutId) {
      const draftWorkout = this.workoutService.createDraftFromWorkout(this.sourceWorkoutId);
      if (draftWorkout) {
        this.workoutContext.setWorkout(draftWorkout);
        this.title = draftWorkout.name || '';
        return;
      }
    }

    const draftWorkout = this.workoutContext.ensureFresh(() => this.workoutService.createRoutineDraft('New Routine'));
    if (draftWorkout) {
      this.title = draftWorkout.name || '';
    }
  }

  cancel(): void {
    this.discardGuard.open();
  }

  save(): void {
    const workout = this.routineDraft();
    if (workout) {
      // Create updated workout with the user's title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      
      // Update the workout first
      this.workoutService.updateWorkout(updatedWorkout);
      
      // Save as template for routines
      this.workoutService.saveAsTemplate(updatedWorkout);

      this.navigationContext.exit();
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.routineDraft();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutService.updateWorkout(updatedWorkout);
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
