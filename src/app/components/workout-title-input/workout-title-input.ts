import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-title-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="jacaona-input-section">
      <input 
        type="text" 
        class="jacaona-input" 
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
      />
    </div>
  `,
  styles: [`
    .jacaona-input-section {
      margin-bottom: var(--jacaona-space-lg);
    }
  `]
})
export class WorkoutTitleInputComponent {
  value = input.required<string>();
  placeholder = input<string>('Workout title');
  valueChange = output<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
