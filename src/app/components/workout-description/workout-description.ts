import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-description',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="jacaona-description-section">
      <div class="jacaona-section-title">Description</div>
      <textarea 
        class="jacaona-description-input" 
        [placeholder]="placeholder()"
        [value]="value()"
        [rows]="rows()"
        (input)="onInput($event)"
      ></textarea>
    </div>
  `,
  styles: [`
    .jacaona-description-section {
      margin-bottom: var(--jacaona-space-lg);
    }

    .jacaona-section-title {
      color: var(--jacaona-text-muted);
      font-size: 12px;
      font-weight: var(--jacaona-font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--jacaona-space-sm);
    }

    .jacaona-description-input {
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
      resize: vertical;
      min-height: 100px;
    }

    .jacaona-description-input::placeholder {
      color: var(--jacaona-text-muted);
    }

    .jacaona-description-input:focus {
      border-color: var(--jacaona-accent-blue);
    }
  `]
})
export class WorkoutDescriptionComponent {
  value = input.required<string>();
  placeholder = input<string>('How did your workout go? Leave some notes');
  rows = input<number>(4);
  valueChange = output<string>();

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.valueChange.emit(textarea.value);
  }
}
