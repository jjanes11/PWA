import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardColor = 'blue' | 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  template: `
    <div class="jacaona-stat-card">
      <div class="jacaona-stat-card__icon" [ngClass]="'jacaona-stat-card__icon--' + color()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path [attr.d]="iconPath()"/>
        </svg>
      </div>
      <div class="jacaona-stat-card__content">
        <div class="jacaona-stat-card__number">
          {{ value() }}
          @if (unit()) {
            <span class="jacaona-stat-card__label">{{ unit() }}</span>
          }
        </div>
        <div class="jacaona-stat-card__label">{{ label() }}</div>
      </div>
    </div>
  `,
  styles: []
})
export class StatCardComponent {
  value = input.required<number | string>();
  label = input.required<string>();
  unit = input<string>('');
  color = input<StatCardColor>('blue');
  iconPath = input.required<string>();
}
