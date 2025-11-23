export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export enum SetType {
  Normal = 'normal',
  Warmup = 'warmup',
  Failure = 'failure',
  Drop = 'drop'
}

export interface Set {
  id: string;
  reps: number;
  weight: number; // in kg
  completed: boolean;
  type?: SetType; // Set type (defaults to SetType.Normal)
  restTime?: number; // in seconds
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  exercises: Exercise[];
  duration?: number; // in minutes
  completed: boolean;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[]; // Same structure as Workout
}

export type WorkoutEntity = Workout | Routine;

export enum WorkoutSource {
  ActiveWorkout = 'activeWorkout',
  RoutineDraft = 'routineDraft',
  PersistedWorkout = 'persistedWorkout',
  PersistedRoutine = 'persistedRoutine'
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalWeight: number;
  averageDuration: number;
}
