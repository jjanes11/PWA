import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../models/workout.models';

@Component({
  selector: 'app-workout-detail',
  imports: [CommonModule],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetailComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workout = signal<Workout | null>(null);
  showMenu = signal(false);
  showDeleteDialog = signal(false);

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

  ngOnInit(): void {
    const workoutId = this.route.snapshot.paramMap.get('id');
    if (workoutId) {
      const foundWorkout = this.workoutService.workouts().find(w => w.id === workoutId);
      if (foundWorkout) {
        this.workout.set(foundWorkout);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openMenu(): void {
    this.showMenu.set(true);
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  saveAsRoutine(): void {
    console.log('Save as routine clicked');
    this.closeMenu();
    // TODO: Implement save as routine functionality
  }

  editWorkout(): void {
    const workout = this.workout();
    if (!workout) return;
    
    this.closeMenu();
    this.router.navigate(['/edit-workout', workout.id]);
  }

  deleteWorkout(): void {
    this.closeMenu();
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
}
