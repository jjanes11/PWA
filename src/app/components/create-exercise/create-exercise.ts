import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { DialogRef } from '../../services/dialog.service';
import { Exercise } from '../../models/workout.models';

@Component({
  selector: 'app-create-exercise',
  standalone: true,
  imports: [FormsModule, TopBarComponent],
  templateUrl: './create-exercise.html',
  styleUrl: './create-exercise.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateExercise {
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Optional: Injected by DialogService when used as dialog
  dialogRef?: DialogRef<CreateExercise, Exercise>;
  
  exerciseName = signal('');
  private queryParams = toSignal(this.route.queryParams);
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');
  
  // Check if being used as a dialog
  isDialog = computed(() => !!this.dialogRef);

  goBack(): void {
    if (this.isDialog()) {
      this.dialogRef?.close();
    } else {
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  save(): void {
    const name = this.exerciseName().trim();
    if (!name) return;
    
    const newExercise = this.exerciseService.addCustomExercise(name);
    
    if (this.isDialog()) {
      this.dialogRef?.close(newExercise);
    } else {
      this.router.navigateByUrl(this.returnUrl());
    }
  }
}
