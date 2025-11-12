import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set } from '../../models/workout.models';
import { createSetTypeMenuMixin } from '../../mixins/set-type-menu.mixin';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-edit-workout',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);
  private navigationService = inject(NavigationService);

  // Convert route params to signal
  private workoutId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  // Local workout being edited (writable signal)
  workout = signal<Workout | null>(null);
  workoutTitle = signal('');
  workoutDescription = signal('');

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

      // Clear currentWorkout if it's set to this workout (from add-exercise navigation)
      const currentWorkout = this.workoutService.currentWorkout();
      if (currentWorkout?.id === id) {
        this.workoutService.setCurrentWorkout(null);
      }
    });
  }
  
  // Set Type Menu Mixin
  private setTypeMenuMixin = createSetTypeMenuMixin(
    this.workoutService,
    () => this.workout(),
    () => this.workout()?.id || null
  );
  
  showSetTypeMenu = this.setTypeMenuMixin.showSetTypeMenu;
  selectedSet = this.setTypeMenuMixin.selectedSet;
  openSetTypeMenu = this.setTypeMenuMixin.openSetTypeMenu.bind(this.setTypeMenuMixin);
  closeSetTypeMenu = this.setTypeMenuMixin.closeSetTypeMenu.bind(this.setTypeMenuMixin);
  setSetType = this.setTypeMenuMixin.setSetType.bind(this.setTypeMenuMixin);
  removeSet = this.setTypeMenuMixin.removeSet.bind(this.setTypeMenuMixin);
  getSetTypeDisplay = this.setTypeMenuMixin.getSetTypeDisplay.bind(this.setTypeMenuMixin);
  getSetTypeClass = this.setTypeMenuMixin.getSetTypeClass.bind(this.setTypeMenuMixin);

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
    const workout = this.workout();
    if (workout) {
      this.router.navigate(['/workout', workout.id]);
    } else {
      this.router.navigate(['/home']);
    }
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

    this.workoutService.updateWorkout(updatedWorkout);
    this.workout.set(updatedWorkout); // Update local signal
    this.router.navigate(['/workout', workout.id]);
  }

  updateSet(exercise: Exercise, set: Set, field: 'weight' | 'reps', value: number): void {
    const workout = this.workout();
    if (!workout) return;

    const updatedSet = { ...set, [field]: value };
    this.workoutService.updateSet(workout.id, exercise.id, updatedSet);
    
    // Refresh local workout
    const refreshedWorkout = this.workoutService.workouts().find(w => w.id === workout.id);
    if (refreshedWorkout) {
      this.workout.set(refreshedWorkout);
    }
  }

  addSet(exercise: Exercise): void {
    const workout = this.workout();
    if (!workout) return;

    this.workoutService.addSetToExercise(workout.id, exercise.id);
    
    // Refresh local workout
    const refreshedWorkout = this.workoutService.workouts().find(w => w.id === workout.id);
    if (refreshedWorkout) {
      this.workout.set(refreshedWorkout);
    }
  }

  addExercise(): void {
    const workout = this.workout();
    if (!workout) return;
    
    // Temporarily set as currentWorkout so add-exercise can add to it
    this.workoutService.setCurrentWorkout(workout);
    
    this.navigationService.navigateWithReturnUrl('/add-exercise', `/edit-workout/${workout.id}`);
  }
}
