import { Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';

interface PersistenceConfig {
  workoutsKey: string;
  routinesKey: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutPersistenceService {
  private readonly config: PersistenceConfig = {
    workoutsKey: 'workout-tracker-data',
    routinesKey: 'workout-templates'
  };

  saveWorkouts(workouts: Workout[]): void {
    try {
      localStorage.setItem(this.config.workoutsKey, JSON.stringify(workouts));
    } catch (error) {
      console.error('Failed to save workout data:', error);
    }
  }

  loadWorkouts(): Workout[] {
    try {
      const data = localStorage.getItem(this.config.workoutsKey);
      if (!data) {
        return [];
      }

      const workouts = JSON.parse(data) as Workout[];
      workouts.forEach(workout => {
        workout.date = new Date(workout.date);
        if (workout.startTime) {
          workout.startTime = new Date(workout.startTime);
        }
        if (workout.endTime) {
          workout.endTime = new Date(workout.endTime);
        }
      });
      return workouts;
    } catch (error) {
      console.error('Failed to load workout data:', error);
      return [];
    }
  }

  saveRoutines(routines: Routine[]): void {
    try {
      localStorage.setItem(this.config.routinesKey, JSON.stringify(routines));
    } catch (error) {
      console.error('Failed to save routines:', error);
    }
  }

  loadRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(this.config.routinesKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Routine[];
    } catch (error) {
      console.error('Failed to load routines:', error);
      return [];
    }
  }
}
