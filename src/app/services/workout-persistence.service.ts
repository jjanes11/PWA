import { Injectable } from '@angular/core';
import { Workout, WorkoutTemplate } from '../models/workout.models';

interface PersistenceConfig {
  workoutsKey: string;
  templatesKey: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutPersistenceService {
  private readonly config: PersistenceConfig = {
    workoutsKey: 'workout-tracker-data',
    templatesKey: 'workout-templates'
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

  saveTemplates(templates: WorkoutTemplate[]): void {
    try {
      localStorage.setItem(this.config.templatesKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  loadTemplates(): WorkoutTemplate[] {
    try {
      const data = localStorage.getItem(this.config.templatesKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as WorkoutTemplate[];
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  }
}
