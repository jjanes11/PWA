import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-info-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jacaona-chart-info">
      {{ displayText() }}
    </div>
  `,
  styles: [`
    .jacaona-chart-info {
      color: var(--jacaona-text-primary);
      font-size: var(--jacaona-font-base);
      font-weight: var(--jacaona-font-weight-medium);
    }
  `]
})
export class ChartInfoDisplayComponent {
  displayText = input.required<string>();
}
