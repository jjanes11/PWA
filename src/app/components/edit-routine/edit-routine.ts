import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Routine } from '../../models/workout.models';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { RoutineService } from '../../services/routine.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { ExerciseListEditorComponent, EditorButtonConfig, BottomButtonConfig, ExerciseListEditorEmptyState } from '../exercise-list-editor/exercise-list-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useNavigationContext } from '../../utils/navigation-context';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutEditor = inject(WorkoutEditorService);
  private routineService = inject(RoutineService);
  private navigationContext = useNavigationContext({
    defaultOrigin: '/workouts'
  });
  
  routine = signal<Routine | null>(null);
  title: string = '';
  
  private exerciseCardController = useExerciseCardController(this.workoutEditor, {
    getWorkout: () => this.routine(),
    onWorkoutUpdated: (updatedRoutine) => {
      this.routine.set(updatedRoutine as Routine);
    }
  });

  // Convert route params to signal
  private routineId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

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

  emptyState: ExerciseListEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add exercises to update this routine.'
  };

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onRoutineUpdated(routine: Routine): void {
    this.routine.set(routine);
    this.routineService.saveRoutine(routine);
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
      this.title = foundRoutine.name;
    });
  }

  cancel(): void {
    this.navigationContext.exit();
  }

  update(): void {
    const routine = this.routine();
    if (routine) {
      // Update the routine with the current title
      const updatedRoutine: Routine = {
        ...routine,
        name: this.title.trim() || 'Untitled Routine'
      };
      
      this.routineService.saveRoutine(updatedRoutine);
      this.navigationContext.exit();
      return;
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to routine before navigating
    const routine = this.routine();
    if (routine && this.title.trim()) {
      const updatedRoutine = { ...routine, name: this.title.trim() };
      this.routine.set(updatedRoutine);
    }
    
    if (routine) {
      this.navigationContext.navigateWithReturn('/add-exercise', {
        workoutId: routine.id,
        workoutSource: 'persistedRoutine'
      });
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const routine = this.routine();
    if (!routine) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }
}
