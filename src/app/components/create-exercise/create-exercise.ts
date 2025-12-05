import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { DialogRef, DialogService } from '../../services/dialog.service';
import { Exercise, EquipmentCategory, MuscleGroup, ExerciseType } from '../../models/workout.models';
import { PropertySelectorDialogComponent, PropertyOption } from '../property-selector-dialog/property-selector-dialog';

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
  private dialogService = inject(DialogService);
  
  // Optional: Injected by DialogService when used as dialog
  dialogRef?: DialogRef<CreateExercise, Exercise>;
  
  exerciseName = signal('');
  equipment = signal<EquipmentCategory | null>(null);
  primaryMuscleGroup = signal<MuscleGroup | null>(null);
  otherMuscles = signal<MuscleGroup[]>([]);
  exerciseType = signal<ExerciseType | null>(null);
  
  // Validation
  attemptedSave = signal(false);
  
  private queryParams = toSignal(this.route.queryParams);
  returnUrl = computed(() => this.queryParams()?.['returnUrl'] || '/workout/new');
  
  // Check if being used as a dialog
  isDialog = computed(() => !!this.dialogRef);
  
  // Validation computed
  isNameValid = computed(() => this.exerciseName().trim().length > 0);
  isEquipmentValid = computed(() => this.equipment() !== null);
  isPrimaryMuscleValid = computed(() => this.primaryMuscleGroup() !== null);
  isExerciseTypeValid = computed(() => this.exerciseType() !== null);
  isFormValid = computed(() => 
    this.isNameValid() && 
    this.isEquipmentValid() && 
    this.isPrimaryMuscleValid() && 
    this.isExerciseTypeValid()
  );
  
  // Show error states
  showNameError = computed(() => this.attemptedSave() && !this.isNameValid());
  showEquipmentError = computed(() => this.attemptedSave() && !this.isEquipmentValid());
  showPrimaryMuscleError = computed(() => this.attemptedSave() && !this.isPrimaryMuscleValid());
  showExerciseTypeError = computed(() => this.attemptedSave() && !this.isExerciseTypeValid());
  
  // Format helpers
  formatEquipment = computed(() => {
    const value = this.equipment();
    return value ? this.formatEnumValue(value) : 'Select equipment';
  });
  formatPrimaryMuscle = computed(() => {
    const value = this.primaryMuscleGroup();
    return value ? this.formatEnumValue(value) : 'Select primary muscle';
  });
  formatOtherMuscles = computed(() => {
    const muscles = this.otherMuscles();
    if (muscles.length === 0) return 'None';
    return muscles.map(m => this.formatEnumValue(m)).join(', ');
  });
  formatExerciseType = computed(() => {
    const value = this.exerciseType();
    return value ? this.formatEnumValue(value) : 'Select exercise type';
  });

  goBack(): void {
    if (this.isDialog()) {
      this.dialogRef?.close();
    } else {
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  save(): void {
    this.attemptedSave.set(true);
    
    // Validate all required fields
    if (!this.isFormValid()) {
      return;
    }
    
    const name = this.exerciseName().trim();
    const equipment = this.equipment();
    const primaryMuscleGroup = this.primaryMuscleGroup();
    const exerciseType = this.exerciseType();
    
    // Type guard - should never happen due to validation, but TypeScript needs it
    if (!equipment || !primaryMuscleGroup || !exerciseType) {
      return;
    }
    
    const newExercise = this.exerciseService.addCustomExercise(
      name,
      equipment,
      primaryMuscleGroup
    );
    
    // Update exercise type and other muscles
    newExercise.exerciseType = exerciseType;
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
  
  private enumToOptions(enumObj: any): PropertyOption[] {
    return Object.values(enumObj).map((value: any) => ({
      value: value as string,
      label: this.formatEnumValue(value as string)
    }));
  }
  
  openEquipmentSelector(): void {
    this.dialogService
      .open(PropertySelectorDialogComponent, {
        fullScreen: true,
        data: {
          title: 'Select Equipment',
          options: this.enumToOptions(EquipmentCategory),
          currentValue: this.equipment()
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.equipment.set(result as EquipmentCategory);
        }
      });
  }
  
  openPrimaryMuscleSelector(): void {
    this.dialogService
      .open(PropertySelectorDialogComponent, {
        fullScreen: true,
        data: {
          title: 'Select Muscle Group',
          options: this.enumToOptions(MuscleGroup),
          currentValue: this.primaryMuscleGroup()
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.primaryMuscleGroup.set(result as MuscleGroup);
        }
      });
  }
  
  openOtherMusclesSelector(): void {
    this.dialogService
      .open(PropertySelectorDialogComponent, {
        fullScreen: true,
        data: {
          title: 'Select Secondary Muscle Groups',
          options: this.enumToOptions(MuscleGroup),
          currentValue: this.otherMuscles(),
          allowMultiple: true
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result !== undefined) {
          this.otherMuscles.set(Array.isArray(result) ? result as MuscleGroup[] : []);
        }
      });
  }
  
  openExerciseTypeSelector(): void {
    this.dialogService
      .open(PropertySelectorDialogComponent, {
        fullScreen: true,
        data: {
          title: 'Select Exercise Type',
          options: this.enumToOptions(ExerciseType),
          currentValue: this.exerciseType()
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.exerciseType.set(result as ExerciseType);
        }
      });
  }
}
