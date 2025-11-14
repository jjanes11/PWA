import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { NavigationService } from '../../services/navigation.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseCardComponent, ExerciseActionEvent } from '../exercise-card/exercise-card';
import { useWorkoutContext } from '../../utils/workout-context';
import { useExerciseCardController } from '../../utils/exercise-card-controller';
import { useDiscardGuard } from '../../utils/discard-guard';

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
  private exerciseCardController = useExerciseCardController(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });
  title: string = '';
  private returnUrl = signal<string>('/workouts');
  private sourceWorkoutId: string | null = null;
  discardGuard = useDiscardGuard({
    message: 'Are you sure you want to discard the routine?',
    confirmText: 'Discard Routine',
    onConfirm: () => this.handleDiscardConfirm()
  });
  
  // Set Type Menu (via controller)
  showSetTypeMenu = this.exerciseCardController.showSetTypeMenu;
  selectedSet = this.exerciseCardController.selectedSet;

  closeSetTypeMenu(): void {
    this.exerciseCardController.closeSetTypeMenu();
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
    this.discardGuard.open();
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
    if (this.exerciseCardController.handleAction(event)) {
      return;
    }
  }

  private handleDiscardConfirm(): void {
    const workout = this.routineDraft();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.router.navigate([this.returnUrl()]);
  }
}
