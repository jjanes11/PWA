import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Workout, Routine, WorkoutSource } from '../../models/workout.models';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { WorkoutService } from '../../services/workout.service';
import { RoutineService } from '../../services/routine.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { ExerciseListEditorComponent, EditorButtonConfig, BottomButtonConfig, ExerciseListEditorEmptyState } from '../exercise-list-editor/exercise-list-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useDiscardGuard } from '../../utils/discard-guard';
import { useCleanupContext } from '../../utils/navigation-context';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutEditor = inject(WorkoutEditorService);
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);
  private routineDraftService = inject(RoutineDraftService);
  
  private queryParams = toSignal(this.route.queryParams);
  
  routineDraft = this.routineDraftService.routineDraftSignal();
  title: string = '';
  
  private cleanup = useCleanupContext({
    cleanup: () => {
      const draft = this.routineDraft();
      if (draft) {
        this.routineDraftService.clearRoutineDraft();
      }
    }
  });
  
  discardGuard = useDiscardGuard({
    message: 'Are you sure you want to discard the routine?',
    confirmText: 'Discard Routine',
    onConfirm: () => this.handleDiscardConfirm()
  });
  
  private exerciseCardController = useExerciseCardController(this.workoutEditor, {
    getWorkout: () => this.routineDraft(),
    onWorkoutUpdated: (workout) => {
      // Routine drafts are stored as Workout type
      if ('date' in workout) {
        this.routineDraftService.setRoutineDraft(workout);
      }
    }
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

  emptyState: ExerciseListEditorEmptyState = {
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

  onWorkoutUpdated(workout: Workout | Routine): void {
    this.routineDraftService.setRoutineDraft(workout as Workout);
  }

  constructor() {}

  ngOnInit(): void {
    // Check if we have a source workout ID from query params
    const sourceWorkoutId = this.queryParams()?.['sourceWorkoutId'];
    
    if (sourceWorkoutId) {
      const sourceWorkout = this.workoutService.findWorkoutById(sourceWorkoutId);
      if (!sourceWorkout) {
        this.router.navigate(['/workouts']);
        return;
      }
      const draftWorkout = this.routineDraftService.createDraftFromWorkout(sourceWorkout);
      this.routineDraftService.setRoutineDraft(draftWorkout);
      this.title = draftWorkout.name || '';
      return;
    }

    // Create a new routine draft if none exists
    if (!this.routineDraft()) {
      const newDraft = this.routineDraftService.createDraft('New Routine');
      this.routineDraftService.setRoutineDraft(newDraft);
      this.title = newDraft.name || '';
    } else {
      this.title = this.routineDraft()?.name || '';
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
      // Update the draft
      this.routineDraftService.setRoutineDraft(updatedWorkout);

      // Save as template for routines
      this.routineService.saveFromWorkout(updatedWorkout);

      // Navigate to workouts page to see the newly created routine
      this.router.navigate(['/workouts']);
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Update draft title before navigating
    const workout = this.routineDraft();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.routineDraftService.setRoutineDraft(updatedWorkout);
    }
    
    // Navigate to add-exercise and return to this page after adding
    if (workout) {
      this.router.navigate(['/add-exercise'], {
        queryParams: {
          workoutId: workout.id,
          source: WorkoutSource.RoutineDraft,
          returnUrl: this.router.url
        }
      });
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }

  private handleDiscardConfirm(): void {
    this.cleanup.performCleanup();
    this.router.navigate(['/workouts']);
  }
}
