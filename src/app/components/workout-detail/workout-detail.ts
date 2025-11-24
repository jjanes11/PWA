import { Component, inject, signal, computed } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { BottomMenuComponent, BottomMenuItem } from '../bottom-menu/bottom-menu';
import { TopBarComponent } from '../top-bar/top-bar';
import { ExerciseCardComponent } from '../exercise-card/exercise-card';
import { WorkoutStatsComponent } from '../workout-stats/workout-stats';
import { Workout } from '../../models/workout.models';

@Component({
  selector: 'app-workout-detail',
  imports: [ConfirmationDialog, BottomMenuComponent, TopBarComponent, ExerciseCardComponent, WorkoutStatsComponent],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetailComponent {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Get returnUrl from query params
  private returnUrl = toSignal(
    this.route.queryParams.pipe(map(params => params['returnUrl'] as string | undefined))
  );

  // Convert route params to signal
  private workoutId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );

  // Computed signal that automatically updates when workoutId changes
  workout = computed(() => {
    const id = this.workoutId();
    if (!id) {
      this.router.navigate(['/home']);
      return null;
    }
    
    const foundWorkout = this.workoutService.workoutsSignal()().find((w: Workout) => w.id === id);
    if (!foundWorkout) {
      this.router.navigate(['/home']);
      return null;
    }
    
    return foundWorkout;
  });

  showMenu = signal(false);
  showDeleteDialog = signal(false);

  menuItems: BottomMenuItem[] = [
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

  goBack(): void {
    const returnUrl = this.returnUrl();
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/home']);
    }
  }

  openMenu(): void {
    this.showMenu.set(true);
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  handleMenuAction(action: string): void {
    this.closeMenu();
    switch (action) {
      case 'save-routine':
        this.saveAsRoutine();
        break;
      case 'edit':
        this.editWorkout();
        break;
      case 'delete':
        this.deleteWorkout();
        break;
    }
  }

  saveAsRoutine(): void {
    const workout = this.workout();
    if (workout) {
      // Navigate to routine/new with workout ID as query param
      this.router.navigate(['/routine/new'], {
        queryParams: { 
          sourceWorkoutId: workout.id
        }
      });
    }
  }

  editWorkout(): void {
    const workout = this.workout();
    if (!workout) return;
    
    this.router.navigate(['/edit-workout', workout.id]);
  }

  deleteWorkout(): void {
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const workout = this.workout();
    if (!workout) return;

    this.workoutService.deleteWorkout(workout.id);
    this.showDeleteDialog.set(false);
    this.router.navigate(['/home']);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  getSetTypeDisplay(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string {
    if (!type || type === 'normal') return '';
    if (type === 'warmup') return 'W';
    if (type === 'failure') return 'F';
    if (type === 'drop') return 'D';
    return '';
  }

  getSetTypeClass(type?: 'normal' | 'warmup' | 'failure' | 'drop'): string {
    if (!type || type === 'normal') return '';
    return `jacaona-set-type-${type}`;
  }
}
