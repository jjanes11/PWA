import { Workout, Routine, Exercise, Set as WorkoutSet } from '../models/workout.models';
import { generateId } from './id-generator';

type TimestampProvider = () => Date;

interface WorkoutCloneOptions {
  timestampProvider?: TimestampProvider;
}

const defaultTimestamp: TimestampProvider = () => new Date();

export function createBaseWorkout(
  name: string,
  options: WorkoutCloneOptions = {}
): Workout {
  const now = (options.timestampProvider ?? defaultTimestamp)();

  return {
    id: generateId(),
    name,
    date: now,
    startTime: now,
    exercises: [],
    completed: false
  };
}

export function workoutFromTemplate(
  routine: Routine,
  options: WorkoutCloneOptions = {}
): Workout {
  const baseWorkout = createBaseWorkout(routine.name, options);

  const exercises: Exercise[] = routine.exercises.map(exerciseTemplate => ({
    id: generateId(),
    name: exerciseTemplate.name,
    equipment: exerciseTemplate.equipment,
    primaryMuscleGroup: exerciseTemplate.primaryMuscleGroup,
    otherMuscles: exerciseTemplate.otherMuscles,
    exerciseType: exerciseTemplate.exerciseType,
    sets: exerciseTemplate.sets.map(setTemplate => ({
      id: generateId(),
      reps: setTemplate.reps,
      weight: setTemplate.weight,
      completed: false,
      type: setTemplate.type
    }))
  }));

  return {
    ...baseWorkout,
    exercises
  };
}

export function cloneWorkoutForDraft(
  sourceWorkout: Workout,
  options: WorkoutCloneOptions = {}
): Workout {
  const now = (options.timestampProvider ?? defaultTimestamp)();

  return {
    id: generateId(),
    name: sourceWorkout.name,
    date: now,
    startTime: now,
    exercises: sourceWorkout.exercises.map(exercise => cloneExercise(exercise)),
    completed: false
  };
}

function cloneExercise(exercise: Exercise): Exercise {
  return {
    id: generateId(),
    name: exercise.name,
    equipment: exercise.equipment,
    primaryMuscleGroup: exercise.primaryMuscleGroup,
    otherMuscles: exercise.otherMuscles,
    exerciseType: exercise.exerciseType,
    sets: exercise.sets.map(set => cloneSet(set))
  };
}

function cloneSet(set: WorkoutSet): WorkoutSet {
  return {
    id: generateId(),
    reps: set.reps,
    weight: set.weight,
    completed: false,
    type: set.type,
    restTime: set.restTime,
    notes: set.notes
  };
}
