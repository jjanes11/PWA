import { Component, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { ExerciseService } from '../../services/exercise.service';
import { TopBarComponent } from '../top-bar/top-bar';

@Component({
  selector: 'app-create-exercise',
  imports: [FormsModule, TopBarComponent],
  templateUrl: './create-exercise.html',
  styleUrl: './create-exercise.css'
})
export class CreateExercise {
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  exerciseName = signal('');
  private queryParams = toSignal(this.route.queryParams);
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');

  goBack(): void {
    this.router.navigateByUrl(this.returnUrl());
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
    this.router.navigateByUrl(this.returnUrl());
  }
}
