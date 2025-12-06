import { Component, computed, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ActiveWorkoutService } from '../../services/active-workout.service';
import { RoutineDraftService } from '../../services/routine-draft.service';
import { MenuItem } from '../card-menu/card-menu';
import { StatCardComponent } from '../stat-card/stat-card';
import { WorkoutListComponent } from '../workout-list/workout-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, StatCardComponent, WorkoutListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private workoutService = inject(WorkoutService);
  private activeWorkoutService = inject(ActiveWorkoutService);
  private routineDraftService = inject(RoutineDraftService);

  workouts = this.workoutService.workoutsSignal();

  menuItems: MenuItem[] = [
    {
      action: 'save-routine',
      icon: 'M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z',
      text: 'Save as Routine'
    },
    {
      action: 'edit',
      icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      text: 'Edit Workout'
    },
    {
      action: 'delete',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      text: 'Delete Workout',
      danger: true
    }
  ];
  
  timeOfDay = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  });

  totalWorkouts = computed(() => {
    const activeWorkoutId = this.activeWorkoutService.getActiveWorkout()?.id;
    const routineDraftId = this.routineDraftService.getRoutineDraft()?.id;
    return this.workouts().filter(w => w.id !== activeWorkoutId && w.id !== routineDraftId).length;
  });
  
  totalVolume = computed(() => {
    const activeWorkoutId = this.activeWorkoutService.getActiveWorkout()?.id;
    const routineDraftId = this.routineDraftService.getRoutineDraft()?.id;
    
    return this.workouts()
      .filter(w => w.id !== activeWorkoutId && w.id !== routineDraftId)
      .reduce((total, workout) => {
        return total + (workout.exercises.reduce((exerciseTotal, exercise) => {
          return exerciseTotal + (exercise.sets.reduce((setTotal, set) => {
            return setTotal + ((set.weight || 0) * (set.reps || 0));
          }, 0));
        }, 0));
      }, 0);
  });

  currentStreak = computed(() => {
    const activeWorkoutId = this.activeWorkoutService.getActiveWorkout()?.id;
    const routineDraftId = this.routineDraftService.getRoutineDraft()?.id;
    const completedWorkouts = this.workouts()
      .filter(w => w.completed && w.id !== activeWorkoutId && w.id !== routineDraftId);
    return completedWorkouts.length > 0 ? Math.min(completedWorkouts.length, 7) : 0;
  });

  avgWorkoutTime = computed(() => {
    const activeWorkoutId = this.activeWorkoutService.getActiveWorkout()?.id;
    const routineDraftId = this.routineDraftService.getRoutineDraft()?.id;
    const completedWorkouts = this.workouts()
      .filter(w => w.completed && w.startTime && w.endTime && w.id !== activeWorkoutId && w.id !== routineDraftId);
    if (completedWorkouts.length === 0) return 0;
    
    const totalTime = completedWorkouts.reduce((sum, w) => {
      if (w.startTime && w.endTime) {
        const duration = Math.round((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / (1000 * 60));
        return sum + duration;
      }
      return sum;
    }, 0);
    return Math.round(totalTime / completedWorkouts.length);
  });

  recentWorkouts = computed(() => {
    const activeWorkoutId = this.activeWorkoutService.getActiveWorkout()?.id;
    const routineDraftId = this.routineDraftService.getRoutineDraft()?.id;

    return this.workouts()
      .filter(w => w.id !== activeWorkoutId && w.id !== routineDraftId) // Exclude in-progress and draft workouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });
}
