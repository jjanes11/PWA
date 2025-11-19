import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { Workout, WorkoutSource } from '../../models/workout.models';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { ExerciseListEditorComponent, EditorButtonConfig, BottomButtonConfig, ExerciseListEditorEmptyState } from '../exercise-list-editor/exercise-list-editor';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useCleanupContext } from '../../utils/navigation-context';

@Component({
  selector: 'app-edit-workout',
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private workoutEditor = inject(WorkoutEditorService);
  private cleanup = useCleanupContext();

  // Get workout ID from route params
  private workoutId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  // Local workout being edited (writable signal)
  workout = signal<Workout | null>(null);
  workoutTitle = signal('');
  workoutDescription = signal('');
  
  constructor() {
    // Load workout when ID changes
    effect(() => {
      const id = this.workoutId();
      if (!id) {
        this.router.navigate(['/home']);
        return;
      }

      const workout = this.workoutService.findWorkoutById(id);
      if (!workout) {
        // Workout was deleted, redirect
        this.router.navigate(['/home']);
        return;
      }

      this.workout.set(workout);
      this.workoutTitle.set(workout.name);
      this.workoutDescription.set(workout.notes || '');
    });
  }
  
  private exerciseCardController = useExerciseCardController<Workout>(this.workoutEditor, {
    getWorkout: () => this.workout(),
    onWorkoutUpdated: (updatedWorkout) => {
      this.workout.set(updatedWorkout);
      this.workoutService.saveWorkout(updatedWorkout);
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

  emptyState: ExerciseListEditorEmptyState = {
    iconPath: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z',
    title: 'No exercises yet',
    message: 'Add an exercise to continue editing this workout.'
  };
  
  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  onWorkoutUpdated(workout: Workout): void {
    this.workout.set(workout);
    this.workoutService.saveWorkout(workout);
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
    this.router.navigate(['/home']);
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

    this.workoutService.saveWorkout(updatedWorkout);
    this.workout.set(updatedWorkout); // Update local signal
    this.router.navigate(['/home']);
  }

  addExercise(): void {
    const workout = this.workout();
    if (!workout) return;
    
    this.router.navigate(['/add-exercise'], {
      queryParams: {
        workoutId: workout.id,
        source: WorkoutSource.PersistedWorkout,
        returnUrl: this.router.url
      }
    });
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
