import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { DialogRef } from '../../services/dialog.service';
import { Exercise, EquipmentCategory, MuscleGroup, ExerciseType } from '../../models/workout.models';

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
  equipment = signal<EquipmentCategory>(EquipmentCategory.None);
  primaryMuscleGroup = signal<MuscleGroup>(MuscleGroup.Other);
  otherMuscles = signal<MuscleGroup[]>([]);
  exerciseType = signal<ExerciseType>(ExerciseType.WeightAndReps);
  
  private queryParams = toSignal(this.route.queryParams);
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');
  
  // Check if being used as a dialog
  isDialog = computed(() => !!this.dialogRef);
  
  // Format helpers
  formatEquipment = computed(() => this.formatEnumValue(this.equipment()));
  formatPrimaryMuscle = computed(() => this.formatEnumValue(this.primaryMuscleGroup()));
  formatOtherMuscles = computed(() => {
    const muscles = this.otherMuscles();
    if (muscles.length === 0) return 'None';
    return muscles.map(m => this.formatEnumValue(m)).join(', ');
  });
  formatExerciseType = computed(() => this.formatEnumValue(this.exerciseType()));

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
    
    const newExercise = this.exerciseService.addCustomExercise(
      name,
      this.equipment(),
      this.primaryMuscleGroup()
    );
    
    // Update exercise type and other muscles
    newExercise.exerciseType = this.exerciseType();
    newExercise.otherMuscles = this.otherMuscles();
    
    if (this.isDialog()) {
      this.dialogRef?.close(newExercise);
    } else {
      this.router.navigateByUrl(this.returnUrl());
    }
  }
  
  private formatEnumValue(value: string): string {
    return value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  openEquipmentSelector(): void {
    // TODO: Open equipment selector dialog
    console.log('Open equipment selector');
  }
  
  openPrimaryMuscleSelector(): void {
    // TODO: Open primary muscle selector dialog
    console.log('Open primary muscle selector');
  }
  
  openOtherMusclesSelector(): void {
    // TODO: Open other muscles selector dialog
    console.log('Open other muscles selector');
  }
  
  openExerciseTypeSelector(): void {
    // TODO: Open exercise type selector dialog
    console.log('Open exercise type selector');
  }
}
