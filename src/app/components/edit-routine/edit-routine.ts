import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutTemplate } from '../../models/workout.models';
import { NavigationService } from '../../services/navigation.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseCardComponent, ExerciseActionEvent } from '../exercise-card/exercise-card';
import { useSetTypeMenu } from '../../utils/set-type-menu';
import { useExerciseSetMutations } from '../../utils/exercise-set-mutations';
import { useWorkoutContext } from '../../utils/workout-context';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseCardComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);
  private workoutContext = useWorkoutContext('active');
  currentWorkout = this.workoutContext.workout;
  private setMutations = useExerciseSetMutations(this.workoutService, {
    getWorkout: () => this.workoutContext.workout()
  });

  // Convert route params to signal
  private templateId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  template = signal<WorkoutTemplate | null>(null);
  title: string = '';

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
    // Effect that loads template when ID changes
    effect(() => {
      const id = this.templateId();
      if (!id) {
        this.router.navigate(['/workouts']);
        return;
      }

      const foundTemplate = this.workoutService.templates().find(t => t.id === id);
      
      if (!foundTemplate) {
        this.router.navigate(['/workouts']);
        return;
      }

      this.template.set(foundTemplate);
      
      // Check if we already have a draft workout (returning from add-exercise)
      const existingDraft = this.workoutContext.workout();
      
      if (existingDraft) {
        // Restore from existing draft
        this.title = existingDraft.name;
      } else {
        // First time loading, create new draft from template
        this.title = foundTemplate.name;
        
        const draftWorkout = this.workoutService.createWorkoutFromTemplate(foundTemplate);
        this.workoutContext.setWorkout(draftWorkout);
      }
    });
  }

  cancel(): void {
    // Clean up draft workout
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  update(): void {
    const template = this.template();
    const workout = this.currentWorkout();
    if (template && workout) {
      // Update the workout with the current title
      workout.name = this.title.trim() || 'Untitled Routine';
      this.workoutService.updateWorkout(workout);
      
      // Delete old template
      this.workoutService.deleteTemplate(template.id);
      
      // Save the draft workout as the new template
      this.workoutService.saveAsTemplate(workout);
      
      // Clean up draft workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutContext.setWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.currentWorkout();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutService.updateWorkout(updatedWorkout);
    }
    
    this.navigationService.navigateWithReturnUrl('/add-exercise', '/routine/edit/' + this.template()?.id);
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    const workout = this.currentWorkout();
    if (!workout) return;

    if (this.setMutations.handle(event)) {
      return;
    }

    if (event.type === 'set-type-click') {
      this.openSetTypeMenu(event.exerciseId, event.data.setId, event.data.event);
    }
  }
}
