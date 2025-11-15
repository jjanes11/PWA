import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutTemplate } from '../../models/workout.models';
import { NavigationService } from '../../services/navigation.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useWorkoutContext } from '../../utils/workout-context';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useNavigationContext } from '../../utils/navigation-context';

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
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);
  private workoutContext = useWorkoutContext('active');
  currentWorkout = this.workoutContext.workout;
  private exerciseCardController = useExerciseCardController(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });
  private navigationContext = useNavigationContext({
    defaultOrigin: '/workouts',
    cleanup: () => {
      const workout = this.currentWorkout();
      if (workout) {
        this.workoutService.deleteWorkout(workout.id);
        this.workoutContext.setWorkout(null);
      }
    }
  });

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

      const foundTemplate = this.workoutService.templates().find(t => t.id === id);
      
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
        
        const draftWorkout = this.workoutService.createWorkoutFromTemplate(foundTemplate);
        this.workoutContext.setWorkout(draftWorkout);
      }
    });
  }

  cancel(): void {
    this.navigationContext.exit();
  }

  update(): void {
    const template = this.template();
    const workout = this.currentWorkout();
    if (template && workout) {
      // Update the workout with the current title
      workout.name = this.title.trim() || 'Untitled Routine';
      this.workoutService.updateWorkout(workout);
      
      // Delete old template
      this.workoutService.deleteTemplate(template.id);
      
      // Save the draft workout as the new template
      this.workoutService.saveAsTemplate(workout);

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
      this.workoutService.updateWorkout(updatedWorkout);
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
