import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Exercise, EquipmentCategory, MuscleGroup, ExerciseType } from '../models/workout.models';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private storageService = inject(StorageService);
  
  private exercises = signal<Exercise[]>(this.initializeExercises());

  // Readonly signal for components to consume
  readonly allExercises = this.exercises.asReadonly();

  private initializeExercises(): Exercise[] {
    const defaultExercises: Exercise[] = [
      // Chest
      { id: '1', name: 'Bench Press', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '2', name: 'Incline Bench Press', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.Triceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '3', name: 'Dumbbell Chest Press', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '4', name: 'Dumbbell Fly', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '5', name: 'Push-ups', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '5a', name: 'Weighted Push-ups', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      { id: '6', name: 'Cable Chest Fly', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Chest, otherMuscles: [MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      
      // Back
      { id: '7', name: 'Deadlift', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.LowerBack, otherMuscles: [MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '8', name: 'Pull-ups', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Lats, otherMuscles: [MuscleGroup.Biceps, MuscleGroup.UpperBack], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '8a', name: 'Weighted Pull-ups', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Lats, otherMuscles: [MuscleGroup.Biceps, MuscleGroup.UpperBack], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      { id: '8b', name: 'Assisted Pull-ups', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Lats, otherMuscles: [MuscleGroup.Biceps, MuscleGroup.UpperBack], exerciseType: ExerciseType.AssistedBodyweight, sets: [] },
      { id: '8c', name: 'Weighted Chin-ups', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Lats, MuscleGroup.UpperBack], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      { id: '8d', name: 'Assisted Chin-ups', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Lats, MuscleGroup.UpperBack], exerciseType: ExerciseType.AssistedBodyweight, sets: [] },
      { id: '9', name: 'Barbell Rows', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.UpperBack, otherMuscles: [MuscleGroup.Lats, MuscleGroup.Biceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '10', name: 'Lat Pulldown', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Lats, otherMuscles: [MuscleGroup.Biceps, MuscleGroup.UpperBack], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '11', name: 'Seated Cable Row', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.UpperBack, otherMuscles: [MuscleGroup.Lats, MuscleGroup.Biceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '12', name: 'Dumbbell Rows', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.UpperBack, otherMuscles: [MuscleGroup.Lats, MuscleGroup.Biceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '13', name: 'T-Bar Row', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.UpperBack, otherMuscles: [MuscleGroup.Lats, MuscleGroup.Biceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      
      // Legs
      { id: '14', name: 'Squat', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '15', name: 'Front Squat', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Abdominals], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '16', name: 'Leg Press', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '17', name: 'Romanian Deadlift', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Hamstrings, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.LowerBack], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '17a', name: 'Single Leg Romanian Deadlift', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Hamstrings, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.LowerBack], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '18', name: 'Leg Curl', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Hamstrings, otherMuscles: [MuscleGroup.Calves], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '18a', name: 'Hamstring Ball Curl', equipment: EquipmentCategory.StabilityBall, primaryMuscleGroup: MuscleGroup.Hamstrings, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Abdominals], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '18b', name: 'Single Leg Hamstring Ball Curl', equipment: EquipmentCategory.StabilityBall, primaryMuscleGroup: MuscleGroup.Hamstrings, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Abdominals], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '19', name: 'Leg Extension', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '20', name: 'Lunges', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '20a', name: 'Weighted Lunges', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      { id: '21', name: 'Bulgarian Split Squat', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '22', name: 'Calf Raise', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Calves, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '23', name: 'Hip Thrust', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Glutes, otherMuscles: [MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '23a', name: 'Weighted Step-ups', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Hamstrings], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      
      // Shoulders
      { id: '24', name: 'Shoulder Press', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '25', name: 'Dumbbell Shoulder Press', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [MuscleGroup.Triceps, MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '26', name: 'Lateral Raise', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '27', name: 'Front Raise', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '28', name: 'Rear Delt Fly', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [MuscleGroup.UpperBack], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '29', name: 'Arnold Press', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Shoulders, otherMuscles: [MuscleGroup.Triceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '30', name: 'Shrugs', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Traps, otherMuscles: [MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      
      // Arms
      { id: '31', name: 'Bicep Curls', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Forearms], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '32', name: 'Barbell Curl', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Forearms], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '33', name: 'Hammer Curl', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Forearms], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '34', name: 'Preacher Curl', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Biceps, otherMuscles: [MuscleGroup.Forearms], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '35', name: 'Tricep Dips', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [MuscleGroup.Chest, MuscleGroup.Shoulders], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '35a', name: 'Weighted Dips', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [MuscleGroup.Chest, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightedBodyweight, sets: [] },
      { id: '35b', name: 'Assisted Dips', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [MuscleGroup.Chest, MuscleGroup.Shoulders], exerciseType: ExerciseType.AssistedBodyweight, sets: [] },
      { id: '36', name: 'Tricep Pushdown', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '37', name: 'Overhead Tricep Extension', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '38', name: 'Skull Crushers', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '39', name: 'Close Grip Bench Press', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.Triceps, otherMuscles: [MuscleGroup.Chest, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      
      // Core
      { id: '40', name: 'Plank', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.Glutes], exerciseType: ExerciseType.Duration, sets: [] },
      { id: '40a', name: 'Copenhagen Plank', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [MuscleGroup.Adductors, MuscleGroup.Shoulders], exerciseType: ExerciseType.Duration, sets: [] },
      { id: '41', name: 'Crunches', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '42', name: 'Russian Twists', equipment: EquipmentCategory.Plate, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '43', name: 'Hanging Leg Raise', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '44', name: 'Cable Crunch', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '45', name: 'Ab Wheel Rollout', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.LowerBack], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      
      // Olympic & Compound
      { id: '46', name: 'Power Clean', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.FullBody, otherMuscles: [MuscleGroup.Traps, MuscleGroup.Shoulders, MuscleGroup.Quadriceps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '47', name: 'Clean and Jerk', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.FullBody, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.Quadriceps, MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      { id: '48', name: 'Snatch', equipment: EquipmentCategory.Barbell, primaryMuscleGroup: MuscleGroup.FullBody, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.Quadriceps, MuscleGroup.Traps], exerciseType: ExerciseType.WeightAndReps, sets: [] },
      
      // Cardio & Mixed
      { id: '49', name: 'Running', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.Cardio, otherMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Calves], exerciseType: ExerciseType.DistanceAndDuration, sets: [] },
      { id: '50', name: 'Cycling', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Cardio, otherMuscles: [MuscleGroup.Quadriceps, MuscleGroup.Calves], exerciseType: ExerciseType.DistanceAndDuration, sets: [] },
      { id: '51', name: 'Rowing Machine', equipment: EquipmentCategory.Machine, primaryMuscleGroup: MuscleGroup.Cardio, otherMuscles: [MuscleGroup.UpperBack, MuscleGroup.Lats, MuscleGroup.Biceps], exerciseType: ExerciseType.DistanceAndDuration, sets: [] },
      { id: '52', name: 'Jump Rope', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Cardio, otherMuscles: [MuscleGroup.Calves, MuscleGroup.Shoulders], exerciseType: ExerciseType.Duration, sets: [] },
      { id: '53', name: 'Burpees', equipment: EquipmentCategory.None, primaryMuscleGroup: MuscleGroup.FullBody, otherMuscles: [MuscleGroup.Chest, MuscleGroup.Quadriceps, MuscleGroup.Shoulders], exerciseType: ExerciseType.BodyweightReps, sets: [] },
      { id: '54', name: 'Weighted Plank', equipment: EquipmentCategory.Plate, primaryMuscleGroup: MuscleGroup.Abdominals, otherMuscles: [MuscleGroup.Shoulders, MuscleGroup.Glutes], exerciseType: ExerciseType.DurationAndWeight, sets: [] },
      { id: '55', name: 'Farmer\'s Walk', equipment: EquipmentCategory.Dumbbell, primaryMuscleGroup: MuscleGroup.Forearms, otherMuscles: [MuscleGroup.Traps, MuscleGroup.Shoulders, MuscleGroup.Abdominals], exerciseType: ExerciseType.WeightAndDistance, sets: [] },
      { id: '56', name: 'Sled Push', equipment: EquipmentCategory.Other, primaryMuscleGroup: MuscleGroup.Quadriceps, otherMuscles: [MuscleGroup.Glutes, MuscleGroup.Calves, MuscleGroup.Shoulders], exerciseType: ExerciseType.WeightAndDistance, sets: [] }
    ];

    const customExercises = this.storageService.loadExercises();
    return [...customExercises, ...defaultExercises];
  }

  addCustomExercise(name: string, equipment: EquipmentCategory = EquipmentCategory.None, primaryMuscleGroup: MuscleGroup = MuscleGroup.Other): Exercise {
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      equipment,
      primaryMuscleGroup,
      exerciseType: ExerciseType.WeightAndReps,
      sets: [],
      isCustom: true
    };

    // Add to the beginning of the list so it appears at the top
    this.exercises.update(exercises => [newExercise, ...exercises]);
    
    // Persist custom exercises to storage
    const customExercises = this.exercises().filter(e => e.isCustom);
    this.storageService.saveExercises(customExercises);
    
    return newExercise;
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercises().find(exercise => exercise.id === id);
  }

  getCustomExercises(): Exercise[] {
    return this.exercises().filter(e => e.isCustom === true);
  }

  searchExercises(query: string): Exercise[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return this.exercises();
    }

    return this.exercises().filter(exercise => 
      exercise.name.toLowerCase().includes(searchTerm) ||
      exercise.primaryMuscleGroup.toLowerCase().includes(searchTerm) ||
      exercise.equipment.toLowerCase().includes(searchTerm)
    );
  }
}
