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
import { MenuItem } from '../card-menu/card-menu';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useDiscardGuard } from '../../utils/discard-guard';
import { useCleanupContext } from '../../utils/navigation-context';
import { EditorButtons, MenuIcons, EmptyStates } from '../../utils/editor-button-configs';

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
  
  private exerciseCardController = useExerciseCardController<Routine>(this.workoutEditor, {
    getWorkout: () => this.routineDraft(),
    onWorkoutUpdated: (routine) => {
      this.routineDraftService.setRoutineDraft(routine);
    },
    onReplaceExercise: (exerciseId: string) => {
      const routine = this.routineDraft();
      if (routine) {
        this.router.navigate(['/add-exercise'], {
          queryParams: {
            workoutId: routine.id,
            source: WorkoutSource.RoutineDraft,
            replaceExerciseId: exerciseId,
            returnUrl: this.router.url
          }
        });
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

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onRoutineUpdated(routine: Routine): void {
    this.routineDraftService.setRoutineDraft(routine);
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
    const routine = this.routineDraft();
    if (routine) {
      // Create updated routine with the user's title
      const updatedRoutine: Routine = {
        ...routine,
        name: this.title.trim() || 'Untitled Routine'
      };
      // Update the draft
      this.routineDraftService.setRoutineDraft(updatedRoutine);

      // Save as routine
      this.routineService.saveRoutine(updatedRoutine);

      // Clear draft and navigate to workouts page
      this.routineDraftService.clearRoutineDraft();
      this.router.navigate(['/workouts']);
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Update draft title before navigating
    const routine = this.routineDraft();
    if (routine && this.title.trim()) {
      const updatedRoutine: Routine = { ...routine, name: this.title.trim() };
      this.routineDraftService.setRoutineDraft(updatedRoutine);
    }
    
    // Navigate to add-exercise and return to this page after adding
    if (routine) {
      this.router.navigate(['/add-exercise'], {
        queryParams: {
          workoutId: routine.id,
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

  onExerciseReorder(event: DragReorderEvent): void {
    const routine = this.routineDraft();
    if (!routine) return;

    const reordered = this.workoutEditor.reorderExercises(routine, event.fromId, event.toId);
    this.routineDraftService.setRoutineDraft(reordered);
  }

  private handleDiscardConfirm(): void {
    this.cleanup.performCleanup();
    this.router.navigate(['/workouts']);
  }
}
