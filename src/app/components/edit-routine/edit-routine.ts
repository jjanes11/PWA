import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutTemplate } from '../../models/workout.models';
import { WorkoutSessionService } from '../../services/workout-session.service';
import { WorkoutTemplateService } from '../../services/workout-template.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { setupEditorContext } from '../../utils/editor-context';
import { useWorkoutActions } from '../../utils/workout-actions';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, WorkoutEditorComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutSession = inject(WorkoutSessionService);
  private workoutTemplates = inject(WorkoutTemplateService);
  private editorContext = setupEditorContext({
    kind: 'active',
    defaultOrigin: '/workouts'
  });
  private workoutContext = this.editorContext.workoutContext;
  currentWorkout = this.workoutContext.workout;
  private exerciseCardController = useExerciseCardController(this.workoutSession, {
    getWorkout: () => this.workoutContext.workout()
  });
  private navigationContext = this.editorContext.navigation;
  private workoutActions = useWorkoutActions({ editorContext: this.editorContext });

  // Convert route params to signal
  private templateId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  template = signal<WorkoutTemplate | null>(null);
  title: string = '';

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

  emptyState: WorkoutEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add exercises to update this routine.'
  };

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  constructor() {
    // Effect that loads template when ID changes
    effect(() => {
      const id = this.templateId();
      if (!id) {
        this.router.navigate(['/workouts']);
        return;
      }

      const foundTemplate = this.workoutTemplates.findTemplateById(id);
      
      if (!foundTemplate) {
        this.router.navigate(['/workouts']);
        return;
      }

      this.template.set(foundTemplate);
      
      // Check if we already have a draft workout (returning from add-exercise)
      const existingDraft = this.workoutContext.workout();
      
      if (existingDraft) {
        // Restore from existing draft
        this.title = existingDraft.name;
      } else {
        // First time loading, create new draft from template
        this.title = foundTemplate.name;
        
        const draftWorkout = this.workoutTemplates.startWorkoutFromTemplate(foundTemplate);
        this.workoutContext.setWorkout(draftWorkout);
      }
    });
  }

  cancel(): void {
    this.workoutActions.discardWorkout();
  }

  update(): void {
    const template = this.template();
    const workout = this.currentWorkout();
    if (template && workout) {
      // Update the workout with the current title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      this.workoutActions.saveWorkout(updatedWorkout);
      this.workoutContext.setWorkout(updatedWorkout);
      
      // Delete old template
      this.workoutTemplates.deleteTemplate(template.id);
      
      // Save the draft workout as the new template
      this.workoutTemplates.saveFromWorkout(updatedWorkout);

      this.navigationContext.exit();
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.currentWorkout();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutActions.saveWorkout(updatedWorkout);
      this.workoutContext.setWorkout(updatedWorkout);
    }
    
    this.navigationContext.navigateWithReturn('/add-exercise');
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const workout = this.currentWorkout();
    if (!workout) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }
}
