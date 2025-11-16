import { Exercise, Set as WorkoutSet, Workout } from '../models/workout.models';

export interface MutationIdFactory {
  idFactory: () => string;
}

export const exerciseMutations = {
  add(
    workout: Workout,
    exerciseName: string,
    options: MutationIdFactory
  ): { workout: Workout; exercise: Exercise } {
    const exercise: Exercise = {
      id: options.idFactory(),
      name: exerciseName,
      sets: []
    };

    return {
      workout: {
        ...workout,
        exercises: [...workout.exercises, exercise]
      },
      exercise
    };
  },

  remove(workout: Workout, exerciseId: string): Workout {
    return {
      ...workout,
      exercises: workout.exercises.filter(exercise => exercise.id !== exerciseId)
    };
  },

  replace(workout: Workout, exerciseId: string, newName: string): Workout {
    return {
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, name: newName } : exercise
      )
    };
  },

  reorder(workout: Workout, draggedExerciseId: string, targetExerciseId: string): Workout {
    const exercises = [...workout.exercises];
    const draggedIndex = exercises.findIndex(exercise => exercise.id === draggedExerciseId);
    const targetIndex = exercises.findIndex(exercise => exercise.id === targetExerciseId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return workout;
    }

    const [draggedExercise] = exercises.splice(draggedIndex, 1);
    exercises.splice(targetIndex, 0, draggedExercise);

    return { ...workout, exercises };
  }
} as const;

export const setMutations = {
  add(
    workout: Workout,
    exerciseId: string,
    options: MutationIdFactory
  ): { workout: Workout; set: WorkoutSet | null } {
    let createdSet: WorkoutSet | null = null;

    const exercises = workout.exercises.map(exercise => {
      if (exercise.id !== exerciseId) {
        return exercise;
      }

      const newSet: WorkoutSet = {
        id: options.idFactory(),
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
      workout: createdSet ? { ...workout, exercises } : workout,
      set: createdSet
    };
  },

  update(workout: Workout, exerciseId: string, updatedSet: WorkoutSet): Workout {
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
    };
  },

  remove(workout: Workout, exerciseId: string, setId: string): Workout {
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
    };
  }
} as const;
