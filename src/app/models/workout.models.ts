export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export type SetType = 'normal' | 'warmup' | 'failure' | 'drop';

export interface Set {
  id: string;
  reps: number;
  weight: number; // in kg
  completed: boolean;
  type?: SetType; // Set type (defaults to 'normal')
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

export type WorkoutSource = 'activeWorkout' | 'routineDraft' | 'persistedWorkout' | 'persistedRoutine';

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalWeight: number;
  averageDuration: number;
}