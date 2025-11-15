import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutSessionService } from '../../services/workout-session.service';

@Component({
  selector: 'app-save-workout',
  imports: [CommonModule, FormsModule],
  templateUrl: './save-workout.html',
  styleUrl: './save-workout.css'
})
export class SaveWorkoutComponent implements OnInit {
  private router = inject(Router);
  private workoutService = inject(WorkoutSessionService);

  currentWorkout = this.workoutService.currentWorkout;
  workoutTitle = signal('');
  workoutDescription = signal('');

  // Computed workout stats
  workoutStats = computed(() => {
    const workout = this.currentWorkout();
    if (!workout) {
      return { duration: 0, volume: 0, sets: 0 };
    }

    const totalSets = workout.exercises.reduce((sum, exercise) => 
      sum + exercise.sets.length, 0
    );

    const totalVolume = workout.exercises.reduce((sum, exercise) =>
      sum + exercise.sets.reduce((setSum, set) => 
        setSum + (set.weight * set.reps), 0
      ), 0
    );

    // Calculate actual duration from start time to now
    let duration = 0;
    if (workout.startTime) {
      const now = new Date();
      const durationMs = now.getTime() - workout.startTime.getTime();
      duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    }

    return {
      duration,
      volume: totalVolume,
      sets: totalSets
    };
  });

  // Format duration for display
  formattedDuration = computed(() => {
    const minutes = this.workoutStats().duration;
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  });

  // Current date and time for "When" section
  workoutDateTime = computed(() => {
    const workout = this.currentWorkout();
    const date = workout?.startTime || new Date();
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
    const workout = this.currentWorkout();
    if (!workout) {
      // If no current workout, redirect to workouts page
      this.router.navigate(['/workouts']);
      return;
    }

    // Set default workout title
    this.workoutTitle.set(workout.name || 'My Workout');
  }

  goBack(): void {
    this.router.navigate(['/workout/new']);
  }

  saveWorkout(): void {
    const workout = this.currentWorkout();
    if (!workout) return;

    const endTime = new Date();
    let finalDuration = 0;
    
    // Calculate final duration
    if (workout.startTime) {
      const durationMs = endTime.getTime() - workout.startTime.getTime();
      finalDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    }

    // Update workout with title, description, completion status, and timing
    const updatedWorkout = {
      ...workout,
      name: this.workoutTitle().trim() || 'My Workout',
      notes: this.workoutDescription().trim(),
      completed: true,
      endTime: endTime,
      duration: finalDuration
    };

    this.workoutService.saveCompletedWorkout(updatedWorkout);

    // Navigate to workouts page
    this.router.navigate(['/workouts']);
  }
}
