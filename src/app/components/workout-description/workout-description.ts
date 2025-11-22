import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-description',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="jacaona-description-section">
      <div class="jacaona-form-label" style="text-transform: uppercase; letter-spacing: 0.5px;">Description</div>
      <textarea 
        class="jacaona-input jacaona-textarea" 
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
