import { Injectable, Signal } from '@angular/core';
import { Workout, Exercise, Set as WorkoutSet, WorkoutTemplate, WorkoutStats } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionService {
  constructor(private readonly store: WorkoutStoreService) {}

  get workouts(): Signal<Workout[]> {
    return this.store.workouts;
  }

  get currentWorkout(): Signal<Workout | null> {
    return this.store.currentWorkout;
  }

  get routineDraft(): Signal<Workout | null> {
    return this.store.routineDraft;
  }

  get workoutInProgressDialog(): Signal<boolean> {
    return this.store.showWorkoutInProgressDialog;
  }

  get stats(): Signal<WorkoutStats> {
    return this.store.stats;
  }

  createWorkout(name: string): Workout {
    const now = new Date();
    const workout: Workout = {
      id: this.store.generateId(),
      name,
      date: now,
      startTime: now,
      exercises: [],
      completed: false
    };

    const workouts = [...this.store.getWorkoutsSnapshot(), workout];
    this.store.commitWorkouts(workouts, workout);
    this.store.setCurrentWorkout(workout);
    return workout;
  }

  createWorkoutFromTemplate(template: WorkoutTemplate): Workout {
    const workout = this.createWorkout(template.name);
    const exercises: Exercise[] = template.exercises.map(exerciseTemplate => ({
      id: this.store.generateId(),
      name: exerciseTemplate.name,
      sets: exerciseTemplate.sets.map(setTemplate => ({
        id: this.store.generateId(),
        reps: setTemplate.reps,
        weight: setTemplate.weight,
        completed: false,
        type: setTemplate.type
      }))
    }));

    const updatedWorkout: Workout = {
      ...workout,
      exercises
    };

    this.updateWorkout(updatedWorkout);
    return updatedWorkout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this.store.getWorkoutsSnapshot().find(w => w.id === workoutId);
    if (!sourceWorkout) {
      return null;
    }

    const now = new Date();
    const draftWorkout: Workout = {
      id: this.store.generateId(),
      name: sourceWorkout.name,
      date: now,
      startTime: now,
      exercises: sourceWorkout.exercises.map(exercise => ({
        id: this.store.generateId(),
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          id: this.store.generateId(),
          reps: set.reps,
          weight: set.weight,
          completed: false,
          type: set.type,
          restTime: set.restTime,
          notes: set.notes
        }))
      })),
      completed: false
    };

    const workouts = [...this.store.getWorkoutsSnapshot(), draftWorkout];
    this.store.commitWorkouts(workouts, draftWorkout);
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const now = new Date();
    const draftWorkout: Workout = {
      id: this.store.generateId(),
      name,
      date: now,
      startTime: now,
      exercises: [],
      completed: false
    };

    const workouts = [...this.store.getWorkoutsSnapshot(), draftWorkout];
    this.store.commitWorkouts(workouts, draftWorkout);
    this.store.setRoutineDraft(draftWorkout);
    return draftWorkout;
  }

  clearRoutineDraft(): void {
    this.store.clearRoutineDraft();
  }

  updateWorkout(workout: Workout): void {
    this.store.updateWorkoutById(workout.id, () => workout);
  }

  deleteWorkout(workoutId: string): void {
    const workouts = this.store.getWorkoutsSnapshot().filter(w => w.id !== workoutId);
    this.store.commitWorkouts(workouts);
  }

  setCurrentWorkout(workout: Workout | null): void {
    this.store.setCurrentWorkout(workout);
  }

  setRoutineDraft(workout: Workout | null): void {
    this.store.setRoutineDraft(workout);
  }

  completeWorkout(workoutId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      completed: true,
      duration: this.calculateDuration(workout)
    }));
  }

  addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
    let createdExercise: Exercise | null = null;

    const updatedWorkout = this.store.updateWorkoutById(workoutId, workout => {
      const exercise: Exercise = {
        id: this.store.generateId(),
        name: exerciseName,
        sets: []
      };
      createdExercise = exercise;

      return {
        ...workout,
        exercises: [...workout.exercises, exercise]
      };
    });

    if (!updatedWorkout || !createdExercise) {
      throw new Error(`Workout ${workoutId} not found`);
    }

    return createdExercise;
  }

  removeExerciseFromWorkout(workoutId: string, exerciseId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    }));
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, name: newExerciseName } : exercise
      )
    }));
  }

  reorderExercises(workoutId: string, draggedExerciseId: string, targetExerciseId: string): void {
    this.store.updateWorkoutById(workoutId, workout => {
      const exercises = [...workout.exercises];
      const draggedIndex = exercises.findIndex(e => e.id === draggedExerciseId);
      const targetIndex = exercises.findIndex(e => e.id === targetExerciseId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return workout;
      }

      const [draggedExercise] = exercises.splice(draggedIndex, 1);
      exercises.splice(targetIndex, 0, draggedExercise);

      return { ...workout, exercises };
    });
  }

  addSetToExercise(workoutId: string, exerciseId: string): WorkoutSet {
    let createdSet: WorkoutSet | null = null;

    const updatedWorkout = this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const newSet: WorkoutSet = {
          id: this.store.generateId(),
          reps: 0,
          weight: 0,
          completed: false
        };

        createdSet = newSet;

        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
      })
    }));

    if (!updatedWorkout || !createdSet) {
      throw new Error(`Workout ${workoutId} or exercise ${exerciseId} not found`);
    }

    return createdSet;
  }

  updateSet(workoutId: string, exerciseId: string, set: WorkoutSet): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(existingSet =>
                existingSet.id === set.id ? set : existingSet
              )
            }
          : exercise
      )
    }));
  }

  removeSetFromExercise(workoutId: string, exerciseId: string, setId: string): void {
    this.store.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(existingSet => existingSet.id !== setId)
            }
          : exercise
      )
    }));
  }

  showWorkoutInProgressDialog(): void {
    this.store.showWorkoutDialog();
  }

  hideWorkoutInProgressDialog(): void {
    this.store.hideWorkoutDialog();
  }

  getWorkoutsSignal(): Signal<Workout[]> {
    return this.workouts;
  }

  getCurrentWorkoutSnapshot(): Workout | null {
    return this.currentWorkout();
  }

  private calculateDuration(workout: Workout): number {
    const now = new Date();
    const start = new Date(workout.date);
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60));
  }
}
