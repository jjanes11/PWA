import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar';
import { DialogRef } from '../../services/dialog.service';

export interface PropertyOption {
  value: string;
  label: string;
}

export interface PropertySelectorData {
  title: string;
  options: PropertyOption[];
  currentValue?: string;
  allowMultiple?: boolean;
}

@Component({
  selector: 'app-property-selector-dialog',
  standalone: true,
  imports: [TopBarComponent],
  templateUrl: './property-selector-dialog.html',
  styleUrl: './property-selector-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertySelectorDialogComponent {
  // Injected by DialogService
  dialogRef!: DialogRef<PropertySelectorDialogComponent, string | string[]>;
  data!: ReturnType<typeof signal<PropertySelectorData>>;
  
  selectedValues = signal<Set<string>>(new Set());
  
  title = computed(() => this.data().title);
  options = computed(() => this.data().options);
  allowMultiple = computed(() => this.data().allowMultiple || false);
  
  constructor() {
    // Initialize selected values after component is created
    setTimeout(() => {
      const currentValue = this.data().currentValue;
      if (currentValue) {
        if (this.allowMultiple() && Array.isArray(currentValue)) {
          this.selectedValues.set(new Set(currentValue));
        } else if (typeof currentValue === 'string') {
          this.selectedValues.set(new Set([currentValue]));
        }
      }
    });
  }
  
  isSelected(value: string): boolean {
    return this.selectedValues().has(value);
  }
  
  selectOption(value: string): void {
    if (this.allowMultiple()) {
      // Multiple selection mode
      const newSet = new Set(this.selectedValues());
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      this.selectedValues.set(newSet);
    } else {
      // Single selection mode - close immediately
      this.dialogRef.close(value);
    }
  }
  
  cancel(): void {
    this.dialogRef.close();
  }
  
  done(): void {
    if (this.allowMultiple()) {
      this.dialogRef.close(Array.from(this.selectedValues()));
    }
  }
}
