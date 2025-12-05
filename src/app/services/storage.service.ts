import { Injectable } from '@angular/core';
import { Workout, Routine, Exercise } from '../models/workout.models';

interface PersistenceConfig {
  workoutsKey: string;
  routinesKey: string;
  exercisesKey: string;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly config: PersistenceConfig = {
    workoutsKey: 'workout-data',
    routinesKey: 'routine-data',
    exercisesKey: 'custom-exercises'
  };

  saveWorkouts(workouts: Workout[]): void {
    this.save(this.config.workoutsKey, workouts, 'workout data');
  }

  loadWorkouts(): Workout[] {
    const workouts = this.load<Workout>(this.config.workoutsKey, 'workout data');
    return workouts.map(this.hydrateWorkoutDates);
  }

  saveRoutines(routines: Routine[]): void {
    this.save(this.config.routinesKey, routines, 'routines');
  }

  loadRoutines(): Routine[] {
    const routines = this.load<Routine>(this.config.routinesKey, 'routines');
    return routines.map(this.hydrateRoutine);
  }

  saveExercises(exercises: Exercise[]): void {
    this.save(this.config.exercisesKey, exercises, 'custom exercises');
  }

  loadExercises(): Exercise[] {
    return this.load<Exercise>(this.config.exercisesKey, 'custom exercises');
  }

  /**
   * Generic set method for export/import service
   */
  async set(key: string, data: any): Promise<void> {
    const storageKey = this.getStorageKey(key);
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generic get method for export/import service
   */
  async get<T>(key: string): Promise<T | null> {
    const storageKey = this.getStorageKey(key);
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) as T : null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all app data (for complete restore)
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.config.workoutsKey);
      localStorage.removeItem(this.config.routinesKey);
      localStorage.removeItem(this.config.exercisesKey);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Map generic keys to storage keys
   */
  private getStorageKey(key: string): string {
    const keyMap: { [key: string]: string } = {
      'workouts': this.config.workoutsKey,
      'routines': this.config.routinesKey,
      'customExercises': this.config.exercisesKey
    };
    return keyMap[key] || key;
  }

  private save<T>(key: string, data: T[], entityName: string): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${entityName}:`, error);
    }
  }

  private load<T>(key: string, entityName: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) as T[] : [];
    } catch (error) {
      console.error(`Failed to load ${entityName}:`, error);
      return [];
    }
  }

  private hydrateWorkoutDates(workout: Workout): Workout {
    return {
      ...workout,
      date: new Date(workout.date),
      startTime: workout.startTime ? new Date(workout.startTime) : undefined,
      endTime: workout.endTime ? new Date(workout.endTime) : undefined
    };
  }

  private hydrateRoutine(routine: Routine): Routine {
    // Ensure all sets have unique IDs
    return {
      ...routine,
      exercises: routine.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          id: set.id || crypto.randomUUID()
        }))
      }))
    };
  }
}
