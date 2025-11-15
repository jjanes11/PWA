import { Exercise, Set as WorkoutSet, Workout } from '../models/workout.models';

export interface MutationIdFactory {
  idFactory: () => string;
}

export function addExercise(
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
}

export function removeExercise(workout: Workout, exerciseId: string): Workout {
  return {
    ...workout,
    exercises: workout.exercises.filter(exercise => exercise.id !== exerciseId)
  };
}

export function replaceExercise(
  workout: Workout,
  exerciseId: string,
  newName: string
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise =>
      exercise.id === exerciseId ? { ...exercise, name: newName } : exercise
    )
  };
}

export function reorderExercises(
  workout: Workout,
  draggedExerciseId: string,
  targetExerciseId: string
): Workout {
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

export function addSet(
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
}

export function updateSet(
  workout: Workout,
  exerciseId: string,
  updatedSet: WorkoutSet
): Workout {
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
}

export function removeSet(workout: Workout, exerciseId: string, setId: string): Workout {
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
