import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutStatsComponent } from '../workout-stats/workout-stats';
import { Workout, WorkoutSource } from '../../models/workout.models';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { ExerciseListEditorComponent } from '../exercise-list-editor/exercise-list-editor';
import { EditorButtons, EmptyStates } from '../../utils/editor-button-configs';
import { useWorkoutEntityEditor } from '../../utils/workout-entity-editor';
import { useEntityLoader } from '../../utils/entity-loader';

@Component({
  selector: 'app-edit-workout',
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent, WorkoutStatsComponent],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  // Use entity loader to handle route params and loading
  private entityLoader = useEntityLoader<Workout>({
    loadEntity: (id) => this.workoutService.findWorkoutById(id),
    onNotFound: () => this.router.navigate(['/home'])
  });

  workout = this.entityLoader.entity;
  workoutTitle = signal('');
  workoutDescription = signal('');
  
  constructor() {
    // Update title and description when workout loads
    effect(() => {
      const w = this.workout();
      if (w) {
        this.workoutTitle.set(w.name);
        this.workoutDescription.set(w.notes || '');
      }
    });
  }
  
  // Entity editor provides all exercise editing functionality
  private entityEditor = useWorkoutEntityEditor<Workout>({
    getEntity: () => this.workout(),
    onEntityUpdated: (workout) => {
      this.workout.set(workout);
      this.workoutService.saveWorkout(workout);
    },
    source: WorkoutSource.PersistedWorkout,
    getTitle: () => this.workoutTitle(),
    returnUrl: '/home'
  });
  
  // Expose editor properties for template
  draggedExerciseId = this.entityEditor.draggedExerciseId;
  dragOverExerciseId = this.entityEditor.dragOverExerciseId;
  menuItems = this.entityEditor.menuItems;
  showSetTypeMenu = this.entityEditor.showSetTypeMenu;
  selectedSet = this.entityEditor.selectedSet;

  headerLeftButton = EditorButtons.cancel();
  headerRightButton = EditorButtons.save();
  bottomPrimaryButton = EditorButtons.addExercise('secondary');

  emptyState = EmptyStates.editWorkout();
  
  closeSetTypeMenu(): void {
    this.entityEditor.closeSetTypeMenu();
  }

  onWorkoutUpdated(workout: Workout): void {
    this.entityEditor.onEntityUpdated(workout);
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
    this.entityEditor.cancel();
  }

  saveWorkout(): void {
    const workout = this.workout();
    if (!workout) return;

    // Update workout with new values before saving
    const updatedWorkout: Workout = {
      ...workout,
      name: this.workoutTitle().trim() || 'Untitled Workout',
      notes: this.workoutDescription().trim()
    };

    this.workout.set(updatedWorkout);
    this.workoutService.saveWorkout(updatedWorkout);
    this.entityEditor.cancel(); // Navigate using editor's cancel (just navigation)
  }

  addExercise(): void {
    this.entityEditor.navigateToAddExercise();
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }
}
