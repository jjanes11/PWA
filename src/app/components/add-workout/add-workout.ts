import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';
import { MenuItem } from '../card-menu/card-menu';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseCardComponent, ExerciseActionEvent } from '../exercise-card/exercise-card';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useWorkoutContext } from '../../utils/workout-context';

@Component({
  selector: 'app-add-workout',
  imports: [CommonModule, ConfirmationDialog, DraggableDirective, SetTypeMenuComponent, ExerciseCardComponent],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css'
})
export class AddWorkoutComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private router = inject(Router);
  private workoutContext = useWorkoutContext('active');
  currentWorkout = this.workoutContext.workout;
  private exerciseCardController = useExerciseCardController(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });
  showDiscardDialog = signal(false);
  selectedExerciseId = signal<string | null>(null);
  draggedExerciseId = signal<string | null>(null);
  
  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;

  menuItems: MenuItem[] = [
    {
      action: 'replace',
      icon: 'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z',
      text: 'Replace Exercise'
    },
    {
      action: 'remove',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      text: 'Remove Exercise',
      danger: true
    }
  ];
  dragOverExerciseId = signal<string | null>(null);
  
  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
  }

  ngOnInit(): void {
    // Create a new workout if none exists
    this.workoutContext.ensureFresh(() => this.workoutService.createWorkout('New Workout'));
  }

  goBack(): void {
    const workout = this.currentWorkout();
    // Only show dialog if workout has exercises
    if (workout && workout.exercises.length > 0) {
      this.workoutService.showWorkoutInProgressDialogMethod();
      this.router.navigate(['/workouts']);
    } else {
      // No exercises, just navigate back and clean up
      if (workout) {
        this.workoutService.deleteWorkout(workout.id);
        this.workoutContext.setWorkout(null);
      }
      this.router.navigate(['/workouts']);
    }
  }

  finishWorkout(): void {
    const workout = this.currentWorkout();
    if (workout && workout.exercises.length > 0) {
      // Navigate to save workout page if there are exercises
      this.router.navigate(['/save-workout']);
    } else {
      // If no exercises, just go back
      this.goBack();
    }
  }

  addExercise(): void {
    this.router.navigate(['/add-exercise']);
  }

  discardWorkout(): void {
    this.showDiscardDialog.set(true);
  }

  onDiscardConfirmed(): void {
    const workout = this.currentWorkout();
    if (workout) {
      // Delete the current workout and clear current workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.showDiscardDialog.set(false);
    this.goBack();
  }

  onDiscardCancelled(): void {
    this.showDiscardDialog.set(false);
  }

  handleMenuAction(exerciseId: string, action: string): void {
    this.selectedExerciseId.set(exerciseId);
    const workout = this.currentWorkout();
    
    switch (action) {
      case 'replace':
        if (exerciseId) {
          this.router.navigate(['/add-exercise'], {
            state: { 
              returnUrl: '/workout/new',
              replaceExerciseId: exerciseId
            }
          });
        }
        break;
      case 'remove':
        if (exerciseId && workout) {
          this.workoutService.removeExerciseFromWorkout(workout.id, exerciseId);
        }
        break;
    }
  }

  onExerciseReorder(event: DragReorderEvent): void {
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.reorderExercises(workout.id, event.fromId, event.toId);
    }
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const workout = this.currentWorkout();
    if (!workout) return;

    if (this.exerciseCardController.handleAction(event)) {
      return;
    }

    switch (event.type) {
      case 'menu':
        this.handleMenuAction(event.exerciseId, event.data);
        break;
    }
  }
}
