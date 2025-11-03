import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set } from '../../models/workout.models';

@Component({
  selector: 'app-edit-workout',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-workout.html',
  styleUrl: './edit-workout.css',
})
export class EditWorkoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);

  workout = signal<Workout | null>(null);
  workoutTitle = signal('');
  workoutDescription = signal('');

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

  ngOnInit(): void {
    const workoutId = this.route.snapshot.paramMap.get('id');
    if (workoutId) {
      const foundWorkout = this.workoutService.workouts().find(w => w.id === workoutId);
      if (foundWorkout) {
        this.workout.set(foundWorkout);
        this.workoutTitle.set(foundWorkout.name);
        this.workoutDescription.set(foundWorkout.notes || '');
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

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
    this.router.navigate(['/workout', workout.id]);
  }

  updateSet(exercise: Exercise, set: Set, field: 'weight' | 'reps', value: number): void {
    const workout = this.workout();
    if (!workout) return;

    const updatedSet = { ...set, [field]: value };
    this.workoutService.updateSet(workout.id, exercise.id, updatedSet);
    
    // Refresh workout
    const updatedWorkout = this.workoutService.workouts().find(w => w.id === workout.id);
    if (updatedWorkout) {
      this.workout.set(updatedWorkout);
    }
  }

  addSet(exercise: Exercise): void {
    const workout = this.workout();
    if (!workout) return;

    this.workoutService.addSetToExercise(workout.id, exercise.id);
    
    // Refresh workout
    const updatedWorkout = this.workoutService.workouts().find(w => w.id === workout.id);
    if (updatedWorkout) {
      this.workout.set(updatedWorkout);
    }
  }

  addExercise(): void {
    const workout = this.workout();
    if (!workout) return;
    
    // Set current workout and navigate to add exercise page
    this.workoutService.setCurrentWorkout(workout);
    this.router.navigate(['/add-exercise'], { 
      state: { returnUrl: `/edit-workout/${workout.id}` } 
    });
  }
}
