export enum WorkoutErrorCode {
  WorkoutNotFound = 'workout-not-found',
  ExerciseNotFound = 'exercise-not-found',
  MutationFailed = 'mutation-failed'
}

export interface WorkoutErrorContext {
  workoutId?: string;
  exerciseId?: string;
  setId?: string;
  mutation?: string;
}

export class WorkoutMutationError extends Error {
  constructor(
    public readonly code: WorkoutErrorCode,
    message: string,
    public readonly context: WorkoutErrorContext = {}
  ) {
    super(message);
    this.name = 'WorkoutMutationError';
  }

  static workoutNotFound(workoutId: string): WorkoutMutationError {
    return new WorkoutMutationError(
      WorkoutErrorCode.WorkoutNotFound,
      `Workout ${workoutId} not found`,
      { workoutId }
    );
  }

  static exerciseNotFound(workoutId: string, exerciseId: string): WorkoutMutationError {
    return new WorkoutMutationError(
      WorkoutErrorCode.ExerciseNotFound,
      `Exercise ${exerciseId} not found in workout ${workoutId}`,
      { workoutId, exerciseId }
    );
  }

  static mutationFailed(mutation: string, context: WorkoutErrorContext = {}): WorkoutMutationError {
    return new WorkoutMutationError(
      WorkoutErrorCode.MutationFailed,
      `Workout mutation failed: ${mutation}`,
      { ...context, mutation }
    );
  }
}
