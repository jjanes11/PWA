import { Injectable, signal } from '@angular/core';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  isCustom?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises = signal<Exercise[]>([
    { id: '1', name: 'Bench Press', category: 'Chest' },
    { id: '2', name: 'Squat', category: 'Legs' },
    { id: '3', name: 'Deadlift', category: 'Back' },
    { id: '4', name: 'Pull-ups', category: 'Back' },
    { id: '5', name: 'Push-ups', category: 'Chest' },
    { id: '6', name: 'Shoulder Press', category: 'Shoulders' },
    { id: '7', name: 'Bicep Curls', category: 'Arms' },
    { id: '8', name: 'Tricep Dips', category: 'Arms' },
    { id: '9', name: 'Lunges', category: 'Legs' },
    { id: '10', name: 'Plank', category: 'Core' },
    { id: '11', name: 'Lat Pulldown', category: 'Back' },
    { id: '12', name: 'Leg Press', category: 'Legs' },
    { id: '13', name: 'Incline Bench Press', category: 'Chest' },
    { id: '14', name: 'Romanian Deadlift', category: 'Legs' },
    { id: '15', name: 'Barbell Rows', category: 'Back' }
  ]);

  // Readonly signal for components to consume
  readonly allExercises = this.exercises.asReadonly();

  addCustomExercise(name: string, category: string = 'Custom'): Exercise {
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      isCustom: true
    };

    // Add to the beginning of the list so it appears at the top
    this.exercises.update(exercises => [newExercise, ...exercises]);
    
    return newExercise;
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercises().find(exercise => exercise.id === id);
  }

  searchExercises(query: string): Exercise[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return this.exercises();
    }

    return this.exercises().filter(exercise => 
      exercise.name.toLowerCase().includes(searchTerm) ||
      exercise.category.toLowerCase().includes(searchTerm)
    );
  }
}
