import { Component, signal, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ExerciseService } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { ExerciseListComponent } from '../exercise-list/exercise-list';
import { DataStoreService } from '../../services/data-store.service';
import { DialogRef, DialogService } from '../../services/dialog.service';
import { WorkoutEntity, Exercise } from '../../models/workout.models';
import { CreateExercise } from '../create-exercise/create-exercise';

/**
 * Dialog for adding exercises to a workout or routine
 * 
 * Receives a workout/routine entity and returns the modified entity with new exercises added
 */
@Component({
  selector: 'app-add-exercise-dialog',
  standalone: true,
  imports: [TopBarComponent, ExerciseListComponent],
  templateUrl: './add-exercise-dialog.html',
  styleUrl: './add-exercise-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExerciseDialogComponent {
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private dataStore = inject(DataStoreService);
  private dialogService = inject(DialogService);
  
  // Injected by DialogService
  dialogRef!: DialogRef<AddExerciseDialogComponent, WorkoutEntity>;
  data!: ReturnType<typeof signal<{ entity: WorkoutEntity; isReplaceMode?: boolean; replaceExerciseId?: string }>>;
  
  selectedExercises = signal<Exercise[]>([]);
  
  entity = computed(() => this.data().entity);
  isReplaceMode = computed(() => this.data().isReplaceMode || false);
  replaceExerciseId = computed(() => this.data().replaceExerciseId);

  allExercises = computed(() => this.exerciseService.allExercises());

  recentExercises = computed(() => {
    const workouts = this.dataStore.workoutsSignal()();
    const finishedWorkouts = workouts
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const recentExerciseNames = new Set<string>();
    const recentExercisesList: Exercise[] = [];

    for (const workout of finishedWorkouts) {
      for (const exercise of workout.exercises) {
        if (!recentExerciseNames.has(exercise.name)) {
          recentExerciseNames.add(exercise.name);
          const exerciseData = this.exerciseService.allExercises().find(e => e.name === exercise.name);
          if (exerciseData) {
            recentExercisesList.push(exerciseData);
          }
        }
      }
    }

    return recentExercisesList.slice(0, 8);
  });

  onExerciseClick(exercise: Exercise): void {
    this.selectedExercises.update(selected => {
      const isSelected = selected.some(e => e.id === exercise.id);
      if (isSelected) {
        return selected.filter(e => e.id !== exercise.id);
      } else {
        return [...selected, exercise];
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(); // No changes
  }

  create(): void {
    // Open create-exercise as nested dialog
    this.dialogService
      .open(CreateExercise, { fullScreen: true })
      .afterClosed()
      .subscribe(newExercise => {
        // Exercise list will automatically update via signals
        // User can now select the newly created exercise
      });
  }

  addSelectedExercises(): void {
    const entity = this.entity();
    const selected = this.selectedExercises();
    
    if (selected.length === 0) return;

    let modifiedEntity: WorkoutEntity;

    if (this.isReplaceMode()) {
      // Replace mode: replace specific exercise, preserving sets
      const replaceId = this.replaceExerciseId();
      if (!replaceId || !selected[0]) return;
      
      modifiedEntity = this.workoutService.replaceExercise(
        entity,
        replaceId,
        selected[0].name
      );
    } else {
      // Add mode: add new exercises with 3 default sets each
      const exerciseNames = selected.map(ex => ex.name);
      const result = this.workoutService.addExercisesToWorkout(
        entity,
        exerciseNames,
        3 // Default number of sets
      );
      modifiedEntity = result.workout;
    }

    this.dialogRef.close(modifiedEntity);
  }
}
