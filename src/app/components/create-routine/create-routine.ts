import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { NavigationService } from '../../services/navigation.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseCardComponent, ExerciseActionEvent } from '../exercise-card/exercise-card';
import { useSetTypeMenu } from '../../utils/set-type-menu';
import { useExerciseSetMutations } from '../../utils/exercise-set-mutations';
import { useWorkoutContext } from '../../utils/workout-context';

@Component({
  selector: 'app-create-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog, SetTypeMenuComponent, ExerciseCardComponent],
  templateUrl: './create-routine.html',
  styleUrl: './create-routine.css'
})
export class CreateRoutineComponent implements OnInit {
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);
  private workoutContext = useWorkoutContext('draft');
  routineDraft = this.workoutContext.workout; // Use routineDraft instead of currentWorkout
  private setMutations = useExerciseSetMutations(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });
  title: string = '';
  showCancelDialog = signal(false);
  private returnUrl = signal<string>('/workouts');
  private sourceWorkoutId: string | null = null;
  
  private setTypeMenu = useSetTypeMenu();
  // Set Type Menu
  showSetTypeMenu = this.setTypeMenu.isOpen;
  selectedSet = this.setTypeMenu.selectedSet;

  openSetTypeMenu(exerciseId: string, setId: string, event: Event): void {
    this.setTypeMenu.open(exerciseId, setId, event);
  }

  closeSetTypeMenu(): void {
    this.setTypeMenu.close();
  }

  constructor() {
    // Get return URL and source workout ID from navigation service
    this.returnUrl.set(this.navigationService.getReturnUrl('/workouts'));
    this.sourceWorkoutId = this.navigationService.getSourceWorkoutId();
  }

  ngOnInit(): void {
    // If we have a source workout ID, create a draft from it
    if (this.sourceWorkoutId) {
      const draftWorkout = this.workoutService.createDraftFromWorkout(this.sourceWorkoutId);
      if (draftWorkout) {
        this.workoutContext.setWorkout(draftWorkout);
        this.title = draftWorkout.name || '';
        return;
      }
    }

    const draftWorkout = this.workoutContext.ensureFresh(() => this.workoutService.createRoutineDraft('New Routine'));
    if (draftWorkout) {
      this.title = draftWorkout.name || '';
    }
  }

  cancel(): void {
    this.showCancelDialog.set(true);
  }

  onDiscardConfirmed(): void {
    const workout = this.routineDraft();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.showCancelDialog.set(false);
    this.router.navigate([this.returnUrl()]);
  }

  onDiscardCancelled(): void {
    this.showCancelDialog.set(false);
  }

  save(): void {
    const workout = this.routineDraft();
    if (workout) {
      // Create updated workout with the user's title
      const updatedWorkout = {
        ...workout,
        name: this.title.trim() || 'Untitled Routine'
      };
      
      // Update the workout first
      this.workoutService.updateWorkout(updatedWorkout);
      
      // Save as template for routines
      this.workoutService.saveAsTemplate(updatedWorkout);
      
      // Clean up draft workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.routineDraft();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutService.updateWorkout(updatedWorkout);
    }
    
    // Navigate to add-exercise and return to this page after adding
    this.navigationService.navigateWithReturnUrl('/add-exercise', '/routine/new');
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    if (this.setMutations.handle(event)) {
      return;
    }

    if (event.type === 'set-type-click') {
      this.openSetTypeMenu(event.exerciseId, event.data.setId, event.data.event);
    }
  }
}
