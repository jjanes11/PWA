import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Set, ExerciseType } from '../../models/workout.models';
import { getSetTypeDisplay, getSetTypeClass } from '../../utils/set-type.utils';
import { DurationPickerDialogComponent } from '../duration-picker-dialog/duration-picker-dialog';

export type SetsTableMode = 'view' | 'edit';

export interface SetChangeEvent {
  setId: string;
  field: 'weight' | 'reps' | 'duration' | 'distance';
  value: number;
}

export interface SetCompleteEvent {
  setId: string;
  completed: boolean;
}

export interface SetTypeClickEvent {
  setId: string;
  event: Event;
}

@Component({
  selector: 'app-sets-table',
  standalone: true,
  imports: [FormsModule, DurationPickerDialogComponent],
  templateUrl: './sets-table.html',
  styleUrl: './sets-table.css'
})
export class SetsTableComponent {
  @Input({ required: true }) sets!: Set[];
  @Input() mode: SetsTableMode = 'view';
  @Input() showCompleteColumn = false;
  @Input() exerciseType?: ExerciseType;
  
  @Output() setChange = new EventEmitter<SetChangeEvent>();
  @Output() setComplete = new EventEmitter<SetCompleteEvent>();
  @Output() setTypeClick = new EventEmitter<SetTypeClickEvent>();

  // Computed properties for column visibility and labels
  showWeight = computed(() => {
    const type = this.exerciseType ?? ExerciseType.WeightAndReps; // Default to weight and reps
    return type === ExerciseType.WeightAndReps || 
           type === ExerciseType.WeightedBodyweight || 
           type === ExerciseType.AssistedBodyweight ||
           type === ExerciseType.DurationAndWeight ||
           type === ExerciseType.WeightAndDistance;
  });

  showReps = computed(() => {
    const type = this.exerciseType ?? ExerciseType.WeightAndReps; // Default to weight and reps
    return type === ExerciseType.WeightAndReps || 
           type === ExerciseType.BodyweightReps || 
           type === ExerciseType.WeightedBodyweight || 
           type === ExerciseType.AssistedBodyweight;
  });

  showDuration = computed(() => {
    const type = this.exerciseType ?? ExerciseType.WeightAndReps; // Default to weight and reps
    return type === ExerciseType.Duration || 
           type === ExerciseType.DurationAndWeight ||
           type === ExerciseType.DistanceAndDuration;
  });

  showDistance = computed(() => {
    const type = this.exerciseType ?? ExerciseType.WeightAndReps; // Default to weight and reps
    return type === ExerciseType.DistanceAndDuration ||
           type === ExerciseType.WeightAndDistance;
  });

  weightLabel = computed(() => {
    const type = this.exerciseType ?? ExerciseType.WeightAndReps;
    if (type === ExerciseType.WeightedBodyweight) return '+KG';
    if (type === ExerciseType.AssistedBodyweight) return '-KG';
    return 'KG';
  });

  getSetTypeDisplay = getSetTypeDisplay;
  getSetTypeClass = getSetTypeClass;

  // Duration picker state
  isDurationPickerOpen = signal(false);
  selectedSetIdForDuration = signal<string | null>(null);
  selectedSetDuration = signal(0);

  formatDuration(seconds: number | undefined): string {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  }

  onDurationClick(setId: string, currentDuration: number | undefined): void {
    if (this.mode === 'edit') {
      this.selectedSetIdForDuration.set(setId);
      this.selectedSetDuration.set(currentDuration || 0);
      this.isDurationPickerOpen.set(true);
    }
  }

  onDurationSelected(duration: number): void {
    const setId = this.selectedSetIdForDuration();
    if (setId) {
      this.setChange.emit({ setId, field: 'duration', value: duration });
    }
  }

  onDurationPickerClosed(): void {
    this.isDurationPickerOpen.set(false);
    this.selectedSetIdForDuration.set(null);
  }

  onWeightChange(setId: string, event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.setChange.emit({ setId, field: 'weight', value });
  }

  onRepsChange(setId: string, event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value) || 0;
    this.setChange.emit({ setId, field: 'reps', value });
  }

  onDistanceChange(setId: string, event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.setChange.emit({ setId, field: 'distance', value });
  }

  onSetTypeClick(setId: string, event: Event): void {
    if (this.mode === 'edit') {
      event.stopPropagation();
        this.setTypeClick.emit({ setId, event });
    }
  }

  onToggleComplete(setId: string): void {
    const set = this.sets.find(s => s.id === setId);
    if (set) {
      this.setComplete.emit({ setId, completed: !set.completed });
    }
  }
}
