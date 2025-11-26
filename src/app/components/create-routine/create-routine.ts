import { Component, inject, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Routine, WorkoutSource } from '../../models/workout.models';
import { WorkoutService } from '../../services/workout.service';
import { RoutineService } from '../../services/routine.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
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
  selector: 'app-create-routine',
  standalone: true,
  imports: [FormsModule, ConfirmationDialog, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);
  private routineDraftService = inject(RoutineDraftService);
  
  private queryParams = toSignal(this.route.queryParams);
  
  // Read returnUrl from query params, default to /workouts
  private returnUrl = computed(() => 
    (this.queryParams()?.['returnUrl'] as string | undefined) || '/workouts'
  );
  
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
  
  // Entity editor provides all exercise editing functionality
  private entityEditor = useWorkoutEntityEditor<Routine>({
    getEntity: () => this.routineDraft(),
    onEntityUpdated: (routine) => this.routineDraftService.setRoutineDraft(routine),
    source: WorkoutSource.RoutineDraft,
    getTitle: () => this.title,
    onCleanup: () => this.routineDraftService.clearRoutineDraft()
  });
  
  // Expose editor properties for template
  draggedExerciseId = this.entityEditor.draggedExerciseId;
  dragOverExerciseId = this.entityEditor.dragOverExerciseId;
  menuItems = this.entityEditor.menuItems;
  showSetTypeMenu = this.entityEditor.showSetTypeMenu;
  selectedSet = this.entityEditor.selectedSet;
  
  headerLeftButton = EditorButtons.cancel();
  headerRightButton = EditorButtons.save();
  bottomPrimaryButton = EditorButtons.addExercisePlus('primary');
  emptyState = EmptyStates.createRoutine();

  closeSetTypeMenu(): void {
    this.entityEditor.closeSetTypeMenu();
  }

  onRoutineUpdated(routine: Routine): void {
    this.entityEditor.onEntityUpdated(routine);
  }

  constructor() {}

  ngOnInit(): void {
    // Check if we have a source workout ID from query params
    const sourceWorkoutId = this.queryParams()?.['sourceWorkoutId'];
    
    if (sourceWorkoutId) {
      const sourceWorkout = this.workoutService.findWorkoutById(sourceWorkoutId);
      if (!sourceWorkout) {
        this.router.navigate(['/start-workout']);
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
      
      // Save as routine to persistent storage
      this.routineService.saveRoutine(updatedRoutine);
      
      // Use entityEditor for cleanup and navigation with returnUrl
      this.entityEditor.save(this.returnUrl());
      return;
    }
    this.entityEditor.cancel(this.returnUrl());
  }

  addExercise(): void {
    // Update draft title before navigating
    const routine = this.routineDraft();
    if (routine && this.title.trim()) {
      const updatedRoutine: Routine = { ...routine, name: this.title.trim() };
      this.routineDraftService.setRoutineDraft(updatedRoutine);
    }
    
    this.entityEditor.navigateToAddExercise();
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }

  private handleDiscardConfirm(): void {
    this.cleanup.performCleanup();
    this.router.navigateByUrl(this.returnUrl());
  }
}
