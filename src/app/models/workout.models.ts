export enum EquipmentCategory {
  None = 'none',
  Barbell = 'barbell',
  Dumbbell = 'dumbbell',
  Kettlebell = 'kettlebell',
  Machine = 'machine',
  Plate = 'plate',
  ResistanceBand = 'resistance-band',
  SuspensionBand = 'suspension-band',
  Other = 'other'
}

export enum MuscleGroup {
  Abdominals = 'abdominals',
  Abductors = 'abductors',
  Adductors = 'adductors',
  Biceps = 'biceps',
  Calves = 'calves',
  Cardio = 'cardio',
  Chest = 'chest',
  Forearms = 'forearms',
  FullBody = 'full-body',
  Glutes = 'glutes',
  Hamstrings = 'hamstrings',
  Lats = 'lats',
  LowerBack = 'lower-back',
  Neck = 'neck',
  Quadriceps = 'quadriceps',
  Shoulders = 'shoulders',
  Traps = 'traps',
  Triceps = 'triceps',
  UpperBack = 'upper-back',
  Other = 'other'
}

export enum ExerciseType {
  WeightAndReps = 'weight-reps',           // reps and kg
  BodyweightReps = 'bodyweight-reps',      // reps only
  WeightedBodyweight = 'weighted-bodyweight', // reps and +kg
  AssistedBodyweight = 'assisted-bodyweight', // reps and -kg
  Duration = 'duration',                    // minutes
  DurationAndWeight = 'duration-weight',    // kg and minutes
  DistanceAndDuration = 'distance-duration', // minutes and meters
  WeightAndDistance = 'weight-distance'     // kg and meters
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  equipment: EquipmentCategory;
  primaryMuscleGroup: MuscleGroup;
  otherMuscles?: MuscleGroup[];
  exerciseType: ExerciseType;
  isCustom?: boolean;
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
