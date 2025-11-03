import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-create-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-exercise.html',
  styleUrl: './create-exercise.css'
})
export class CreateExercise {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  
  exerciseName = signal('');
  private returnUrl = signal<string>('/workout/new');

  constructor() {
    // Check if we have a return URL from navigation state
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    if (state && state['returnUrl']) {
      this.returnUrl.set(state['returnUrl']);
    } else {
      // Check history state as fallback
      const historyState = history.state;
      if (historyState && historyState['returnUrl']) {
        this.returnUrl.set(historyState['returnUrl']);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/add-exercise'], {
      state: { returnUrl: this.returnUrl() }
    });
  }

  save(): void {
    const name = this.exerciseName().trim();
    if (!name) {
      return;
    }
    
    // Add the custom exercise to the service
    const newExercise = this.exerciseService.addCustomExercise(name);
    console.log('Created custom exercise:', newExercise);
    
    // Navigate back to add-exercise page with the new exercise available
    this.router.navigate(['/add-exercise'], {
      state: { returnUrl: this.returnUrl() }
    });
  }
}
