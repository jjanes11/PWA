import { Component, inject, effect, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutStatsComponent } from '../workout-stats/workout-stats';
import { WorkoutTitleInputComponent } from '../workout-title-input/workout-title-input';
import { WorkoutWhenComponent } from '../workout-when/workout-when';
import { WorkoutDescriptionComponent } from '../workout-description/workout-description';
import { Workout, WorkoutSource } from '../../models/workout.models';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { ExerciseListEditorComponent } from '../exercise-list-editor/exercise-list-editor';
import { EditorButtons, EmptyStates } from '../../utils/editor-button-configs';
import { useWorkoutEntityEditor } from '../../utils/workout-entity-editor';
import { useEntityLoader } from '../../utils/entity-loader';
import { DialogService } from '../../services/dialog.service';
import { AddExerciseDialogComponent } from '../add-exercise-dialog/add-exercise-dialog';
import { generateId } from '../../utils/id-generator';

@Component({
  selector: 'app-edit-workout',
  imports: [FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent, WorkoutStatsComponent, WorkoutTitleInputComponent, WorkoutWhenComponent, WorkoutDescriptionComponent],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private dialogService = inject(DialogService);

  // Read query params
  private queryParams = toSignal(this.route.queryParams);
  private returnUrl = computed(() => 
    (this.queryParams()?.['returnUrl'] as string | undefined) || '/home'
  );
  private dateParam = computed(() => 
    this.queryParams()?.['date'] as string | undefined
  );

  // Use entity loader to handle route params and loading
  private entityLoader = useEntityLoader<Workout>({
    loadEntity: (id) => {
      if (id === 'new') return null; // Will be handled in effect
      return this.workoutService.findWorkoutById(id);
    },
    onNotFound: () => {
      // Only navigate away if it's not the 'new' case
      const id = this.entityLoader.entityId();
      if (id !== 'new') {
        this.router.navigate(['/home']);
      }
    }
  });

  workout = signal<Workout | null>(null);
  workoutTitle = signal('Workout');
  workoutDescription = signal('');
  isTransient = signal(false);
  
  constructor() {
    // Handle loading existing workout OR creating new transient workout
    effect(() => {
      const loadedWorkout = this.entityLoader.entity();
      const entityId = this.entityLoader.entityId();
      
      if (loadedWorkout) {
        // Existing workout
        this.workout.set(loadedWorkout);
        this.workoutTitle.set(loadedWorkout.name);
        this.workoutDescription.set(loadedWorkout.notes || '');
        this.isTransient.set(false);
      } else if (entityId === 'new' && !this.workout()) {
        // Create new transient workout
        const dateStr = this.dateParam();
        const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
        
        const transientWorkout: Workout = {
          id: generateId(),
          name: 'Workout',
          exercises: [],
          date: date,
          startTime: date,
          endTime: date,
          completed: true,
          notes: ''
        };
        
        this.workout.set(transientWorkout);
        this.workoutTitle.set('Workout');
        this.workoutDescription.set('');
        this.isTransient.set(true);
      }
    });
  }
  
  // Entity editor provides all exercise editing functionality
  private entityEditor = useWorkoutEntityEditor<Workout>({
    getEntity: () => this.workout(),
    onEntityUpdated: (workout) => {
      this.workout.set(workout);
      // Only auto-save if not transient
      if (!this.isTransient()) {
        this.workoutService.saveWorkout(workout);
      }
    },
    source: WorkoutSource.PersistedWorkout,
    getTitle: () => this.workoutTitle()
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
  
  // Show "Log Workout" for new transient workouts, "Edit Workout" for existing
  pageTitle = computed(() => this.isTransient() ? 'Log Workout' : 'Edit Workout');
  
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
      sum + e.sets.reduce((setSum, s) => setSum + ((s.weight || 0) * (s.reps || 0)), 0), 0);
    
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
    // For transient workouts, just discard (don't save)
    // For existing workouts, changes are already auto-saved
    this.router.navigateByUrl(this.returnUrl());
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
    
    // Always save (first time for transient, update for existing)
    this.workoutService.saveWorkout(updatedWorkout);
    
    // Navigate back
    this.router.navigateByUrl(this.returnUrl());
  }

  addExercise(): void {
    const workout = this.workout();
    if (!workout) return;
    
    this.dialogService
      .open(AddExerciseDialogComponent, { 
        data: { entity: workout },
        fullScreen: true
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // User added exercises - update workout
          this.workout.set(result as Workout);
          // Only auto-save if not transient
          if (!this.isTransient()) {
            this.workoutService.saveWorkout(result as Workout);
          }
        }
      });
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }
}
