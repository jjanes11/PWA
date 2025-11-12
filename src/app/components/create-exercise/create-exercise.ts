import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-create-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-exercise.html',
  styleUrl: './create-exercise.css'
})
export class CreateExercise {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private navigationService = inject(NavigationService);
  
  exerciseName = signal('');
  private returnUrl = signal<string>('/workout/new');

  constructor() {
    // Get return URL from navigation service
    this.returnUrl.set(this.navigationService.getReturnUrl('/workout/new'));
  }

  goBack(): void {
    this.navigationService.navigateWithReturnUrl('/add-exercise', this.returnUrl());
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
    this.navigationService.navigateWithReturnUrl('/add-exercise', this.returnUrl());
  }
}
