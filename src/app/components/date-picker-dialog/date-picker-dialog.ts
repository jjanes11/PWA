import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef } from '../../services/dialog.service';
import { TopBarComponent } from '../top-bar/top-bar';

@Component({
  selector: 'app-date-picker-dialog',
  standalone: true,
  imports: [TopBarComponent],
  templateUrl: './date-picker-dialog.html',
  styleUrl: './date-picker-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerDialogComponent {
  dialogRef!: DialogRef<DatePickerDialogComponent, Date>;
  
  selectedDate = signal<string>(this.formatDate(new Date()));
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }
  
  cancel(): void {
    this.dialogRef.close();
  }
  
  confirm(): void {
    const dateStr = this.selectedDate();
    if (dateStr) {
      const date = new Date(dateStr + 'T12:00:00');
      this.dialogRef.close(date);
    }
  }
}
