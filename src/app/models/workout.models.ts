export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export type SetType = 'normal' | 'warmup' | 'failure' | 'drop';

export interface Set {
  id: string;
  reps: number;
  weight: number; // in lbs or kg
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

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  sets: SetTemplate[];
}

export interface SetTemplate {
  reps: number;
  weight: number;
  type?: SetType; // Set type (defaults to 'normal')
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalWeight: number;
  averageDuration: number;
}