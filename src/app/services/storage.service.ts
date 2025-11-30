import { Injectable } from '@angular/core';
import { Workout, Routine } from '../models/workout.models';
import { Exercise } from './exercise.service';

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
