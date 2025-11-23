import { Component, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../services/exercise.service';

@Component({
  selector: 'app-exercise-list',
  imports: [FormsModule],
  templateUrl: './exercise-list.html',
  styleUrl: './exercise-list.css'
})
export class ExerciseListComponent {
  // Inputs
  allExercises = input.required<Exercise[]>();
  recentExercises = input<Exercise[]>([]);
  selectedExercises = input<Exercise[]>([]);
  showSearch = input(true);
  
  // Outputs
  exerciseClick = output<Exercise>();
  searchChange = output<string>();
  
  // Internal state
  searchQuery = signal('');
  
  filteredExercises = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allExercises();
    }
    return this.allExercises().filter(exercise => 
      exercise.name.toLowerCase().includes(query) ||
      exercise.category.toLowerCase().includes(query)
    );
  });
  
  displayedRecentExercises = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      return []; // Don't show recent exercises when searching
    }
    return this.recentExercises();
  });
  
  onSearchChange(): void {
    this.searchChange.emit(this.searchQuery());
  }
  
  selectExercise(exercise: Exercise): void {
    this.exerciseClick.emit(exercise);
  }
  
  isExerciseSelected(exercise: Exercise): boolean {
    return this.selectedExercises().some(e => e.id === exercise.id);
  }
}
