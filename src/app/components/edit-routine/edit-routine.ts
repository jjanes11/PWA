import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Routine, Workout } from '../../models/workout.models';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { RoutineService } from '../../services/routine.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useNavigationContext } from '../../utils/navigation-context';
import { ActiveWorkoutService } from '../../services/active-workout.service';

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
  private workoutEditor = inject(WorkoutEditorService);
  private routineService = inject(RoutineService);
  private activeWorkoutService = inject(ActiveWorkoutService);
  private navigationContext = useNavigationContext({
    defaultOrigin: '/workouts'
  });
  activeWorkout = this.activeWorkoutService.activeWorkoutSignal();
  private exerciseCardController = useExerciseCardController(this.workoutEditor, {
    getWorkout: () => this.activeWorkout(),
    onWorkoutUpdated: (workout) => {
      this.activeWorkoutService.setActiveWorkout(workout);
    }
  });

  // Convert route params to signal
  private routineId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  routine = signal<Routine | null>(null);
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

  onWorkoutUpdated(workout: Workout): void {
    this.workoutService.updateActiveWorkout(workout);
  }

  constructor() {
    // Effect that loads routine when ID changes
    effect(() => {
      const id = this.routineId();
      if (!id) {
        this.router.navigate(['/workouts']);
        return;
      }

      const foundRoutine = this.routineService.findRoutineById(id);
      
      if (!foundRoutine) {
        this.router.navigate(['/workouts']);
        return;
      }

      this.routine.set(foundRoutine);
      
      // Check if we already have a draft workout (returning from add-exercise)
      const existingDraft = this.activeWorkout();
      
      if (existingDraft) {
        // Restore from existing draft
        this.title = existingDraft.name;
      } else {
        // First time loading, create new draft from routine
        this.title = foundRoutine.name;
        
        const draftWorkout = this.routineService.startWorkoutFromRoutine(foundRoutine);
        this.activeWorkoutService.setActiveWorkout(draftWorkout);
      }
    });
  }

  cancel(): void {
    this.navigationContext.exit();
  }

  update(): void {
    const routine = this.routine();
    const workout = this.activeWorkout();
    if (routine && workout) {
      // Update the workout with the current title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      this.activeWorkoutService.setActiveWorkout(updatedWorkout);
      
      // Delete old routine
      this.routineService.deleteRoutine(routine.id);
      
      // Save the draft workout as the new routine
      this.routineService.saveFromWorkout(updatedWorkout);

      this.navigationContext.exit();
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.activeWorkout();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.activeWorkoutService.setActiveWorkout(updatedWorkout);
    }
    
    if (workout) {
      this.navigationContext.navigateWithReturn('/add-exercise', {
        workoutId: workout.id,
        workoutSource: 'activeWorkout'
      });
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const workout = this.activeWorkout();
    if (!workout) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }
}
