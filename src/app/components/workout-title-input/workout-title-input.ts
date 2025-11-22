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
        class="jacaona-title-input" 
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

    .jacaona-title-input {
      width: 100%;
      background: var(--jacaona-bg-secondary);
      border: 1px solid var(--jacaona-border);
      border-radius: var(--jacaona-radius-md);
      padding: var(--jacaona-space-lg);
      color: white;
      font-size: 16px;
      font-family: var(--jacaona-font-primary);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .jacaona-title-input::placeholder {
      color: var(--jacaona-text-muted);
    }

    .jacaona-title-input:focus {
      border-color: var(--jacaona-accent-blue);
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
