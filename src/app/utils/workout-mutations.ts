import { Exercise, Set as WorkoutSet, Workout, Routine, EquipmentCategory, MuscleGroup, ExerciseType } from '../models/workout.models';
import { generateId } from './id-generator';

export const exerciseMutations = {
  add<T extends Workout | Routine>(
    workout: T,
    exerciseName: string,
  ): { workout: T; exercise: Exercise } {
    const exercise: Exercise = {
      id: generateId(),
      name: exerciseName,
      equipment: EquipmentCategory.None,
      primaryMuscleGroup: MuscleGroup.Other,
      exerciseType: ExerciseType.WeightAndReps,
      sets: []
    };

    return {
      workout: {
        ...workout,
        exercises: [...workout.exercises, exercise]
      } as T,
      exercise
    };
  },

  remove<T extends Workout | Routine>(workout: T, exerciseId: string): T {
    return {
      ...workout,
      exercises: workout.exercises.filter(exercise => exercise.id !== exerciseId)
    } as T;
  },

  replace<T extends Workout | Routine>(workout: T, exerciseId: string, newName: string): T {
    return {
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, name: newName } : exercise
      )
    } as T;
  },

  reorder<T extends Workout | Routine>(workout: T, draggedExerciseId: string, targetExerciseId: string): T {
    const exercises = [...workout.exercises];
    const draggedIndex = exercises.findIndex(exercise => exercise.id === draggedExerciseId);
    const targetIndex = exercises.findIndex(exercise => exercise.id === targetExerciseId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return workout;
    }

    const [draggedExercise] = exercises.splice(draggedIndex, 1);
    exercises.splice(targetIndex, 0, draggedExercise);

    return { ...workout, exercises } as T;
  }
} as const;

export const setMutations = {
  add<T extends Workout | Routine>(
    workout: T,
    exerciseId: string,
  ): { workout: T; set: WorkoutSet | null } {
    let createdSet: WorkoutSet | null = null;

    const exercises = workout.exercises.map(exercise => {
      if (exercise.id !== exerciseId) {
        return exercise;
      }

      const newSet: WorkoutSet = {
        id: generateId(),
        reps: 0,
        weight: 0,
        completed: false
      };

      createdSet = newSet;

      return {
        ...exercise,
        sets: [...exercise.sets, newSet]
      };
    });

    return {
      workout: createdSet ? { ...workout, exercises } as T : workout,
      set: createdSet
    };
  },

  update<T extends Workout | Routine>(workout: T, exerciseId: string, updatedSet: WorkoutSet): T {
    return {
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(existingSet =>
                existingSet.id === updatedSet.id ? updatedSet : existingSet
              )
            }
          : exercise
      )
    } as T;
  },

  remove<T extends Workout | Routine>(workout: T, exerciseId: string, setId: string): T {
    return {
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(existingSet => existingSet.id !== setId)
            }
          : exercise
      )
    } as T;
  }
} as const;
