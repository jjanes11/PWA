import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../models/workout.models';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { WorkoutEditorComponent, EditorButtonConfig, BottomButtonConfig, WorkoutEditorEmptyState } from '../workout-editor/workout-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { setupEditorContext } from '../../utils/editor-context';
import { useWorkoutActions } from '../../utils/workout-actions';

@Component({
  selector: 'app-edit-workout',
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, WorkoutEditorComponent],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private editorContext = setupEditorContext({
    kind: 'active',
    defaultOrigin: '/home',
    cleanupMode: 'none'
  });
  private navigationContext = this.editorContext.navigation;
  private workoutActions = useWorkoutActions({ editorContext: this.editorContext });

  // Convert route params to signal
  private workoutId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  // Local workout being edited (writable signal)
  workout = signal<Workout | null>(null);
  workoutTitle = signal('');
  workoutDescription = signal('');
  private exerciseCardController = useExerciseCardController(this.workoutService, {
    getWorkout: () => this.workout(),
    refreshWorkout: (workoutId: string) => {
      const refreshedWorkout = this.workoutService.workouts().find(w => w.id === workoutId);
      if (refreshedWorkout) {
        this.workout.set(refreshedWorkout);
      }
    }
  });
  
  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;

  headerLeftButton: EditorButtonConfig = {
    label: 'Cancel',
    variant: 'ghost'
  };

  headerRightButton: EditorButtonConfig = {
    label: 'Save'
  };

  bottomPrimaryButton: BottomButtonConfig = {
    label: 'Add Exercise',
    variant: 'secondary'
  };

  emptyState: WorkoutEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add an exercise to continue editing this workout.'
  };

  constructor() {
    // Effect that loads workout when ID changes
    effect(() => {
      const id = this.workoutId();
      if (!id) {
        this.router.navigate(['/home']);
        return;
      }

      const foundWorkout = this.workoutService.workouts().find(w => w.id === id);
      if (!foundWorkout) {
        this.router.navigate(['/home']);
        return;
      }

      // Update local signals
      this.workout.set(foundWorkout);
      this.workoutTitle.set(foundWorkout.name);
      this.workoutDescription.set(foundWorkout.notes || '');

      this.navigationContext.setOrigin(`/workout/${foundWorkout.id}`);

      // Clear currentWorkout if it's set to this workout (from add-exercise navigation)
      const currentWorkout = this.workoutService.currentWorkout();
      if (currentWorkout?.id === id) {
        this.workoutService.setCurrentWorkout(null);
      }
    });
  }
  
  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  // Computed workout stats
  workoutStats = computed(() => {
    const w = this.workout();
    if (!w) return { duration: '0m', volume: 0, sets: 0 };

    const totalSets = w.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    const totalVolume = w.exercises.reduce((sum, e) => 
      sum + e.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0), 0);
    
    let durationStr = '0m';
    if (w.startTime && w.endTime) {
      const durationMinutes = Math.floor((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 1000 / 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      if (hours > 0) {
        durationStr = `${hours}h ${minutes}m`;
      } else {
        durationStr = `${minutes}m`;
      }
    }

    return {
      duration: durationStr,
      volume: totalVolume,
      sets: totalSets
    };
  });

  workoutDateTime = computed(() => {
    const w = this.workout();
    if (!w?.startTime) return '';
    
    const date = new Date(w.startTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  });

  cancel(): void {
    this.workoutActions.discardWorkout({ skipCleanup: true });
  }

  saveWorkout(): void {
    const workout = this.workout();
    if (!workout) return;

    // Update workout with new values
    const updatedWorkout: Workout = {
      ...workout,
      name: this.workoutTitle().trim() || 'Untitled Workout',
      notes: this.workoutDescription().trim()
    };

    this.workoutActions.saveWorkout(updatedWorkout);
    this.workout.set(updatedWorkout); // Update local signal
    this.navigationContext.exit({ skipCleanup: true });
  }

  addExercise(): void {
    const workout = this.workout();
    if (!workout) return;
    
    // Temporarily set as currentWorkout so add-exercise can add to it
    this.workoutService.setCurrentWorkout(workout);
    
    this.navigationContext.navigateWithReturn('/add-exercise');
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const workout = this.workout();
    if (!workout) return;

    const exercise = workout.exercises.find(e => e.id === event.exerciseId);
    if (!exercise) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }
}
