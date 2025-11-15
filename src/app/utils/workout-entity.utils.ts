import { Workout, Routine, Exercise, Set as WorkoutSet } from '../models/workout.models';

type IdFactory = () => string;

type TimestampProvider = () => Date;

interface WorkoutCloneOptions {
  idFactory: IdFactory;
  timestampProvider?: TimestampProvider;
}

const defaultTimestamp: TimestampProvider = () => new Date();

export function createBaseWorkout(
  name: string,
  options: WorkoutCloneOptions
): Workout {
  const now = (options.timestampProvider ?? defaultTimestamp)();

  return {
    id: options.idFactory(),
    name,
    date: now,
    startTime: now,
    exercises: [],
    completed: false
  };
}

export function workoutFromTemplate(
  routine: Routine,
  options: WorkoutCloneOptions
): Workout {
  const baseWorkout = createBaseWorkout(routine.name, options);

  const exercises: Exercise[] = routine.exercises.map(exerciseTemplate => ({
    id: options.idFactory(),
    name: exerciseTemplate.name,
    sets: exerciseTemplate.sets.map(setTemplate => ({
      id: options.idFactory(),
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
  options: WorkoutCloneOptions
): Workout {
  const now = (options.timestampProvider ?? defaultTimestamp)();

  return {
    id: options.idFactory(),
    name: sourceWorkout.name,
    date: now,
    startTime: now,
    exercises: sourceWorkout.exercises.map(exercise => cloneExercise(exercise, options.idFactory)),
    completed: false
  };
}

export function cloneExercise(exercise: Exercise, idFactory: IdFactory): Exercise {
  return {
    id: idFactory(),
    name: exercise.name,
    sets: exercise.sets.map(set => cloneSet(set, idFactory))
  };
}

export function cloneSet(set: WorkoutSet, idFactory: IdFactory): WorkoutSet {
  return {
    id: idFactory(),
    reps: set.reps,
    weight: set.weight,
    completed: false,
    type: set.type,
    restTime: set.restTime,
    notes: set.notes
  };
}
