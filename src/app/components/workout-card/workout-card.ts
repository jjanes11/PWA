import { Component, input, output } from '@angular/core';

import { Workout } from '../../models/workout.models';
import { CardMenuComponent, MenuItem } from '../card-menu/card-menu';

@Component({
  selector: 'app-workout-card',
  imports: [CardMenuComponent],
  template: `
    <div class="jacaona-workout-card">
      <div class="jacaona-workout-card-content" (click)="cardClick.emit()">
        <div class="jacaona-workout-header">
          <div class="jacaona-workout-info">
            <h3 class="jacaona-workout-name">{{ workout().name }}</h3>
            @if (workout().notes) {
              <p class="jacaona-workout-description">{{ workout().notes }}</p>
            }
            <p class="jacaona-workout-meta">
              {{ formattedDate() }} • 
              {{ workout().exercises.length || 0 }} exercises •
              {{ duration() }}
            </p>
          </div>
        </div>
        
        @if (workout().exercises && workout().exercises.length > 0) {
          <div class="jacaona-workout-preview">
            @for (exercise of workout().exercises.slice(0, 3); track exercise.id) {
              <span class="jacaona-exercise-tag">{{ exercise.name }}</span>
            }
            @if (workout().exercises.length > 3) {
              <span class="jacaona-exercise-more">+{{ workout().exercises.length - 3 }} more</span>
            }
          </div>
        }
      </div>
      <app-card-menu
        [menuId]="workout().id"
        [items]="menuItems()"
        (action)="menuAction.emit($event)">
        <button class="jacaona-workout-menu-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </app-card-menu>
    </div>
  `,
  styles: [`
    .jacaona-workout-card {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--jacaona-border);
      border-radius: 0;
      padding: var(--jacaona-space-md);
      cursor: pointer;
      transition: background-color 0.15s ease;
      text-decoration: none;
      color: inherit;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--jacaona-space-sm);
      width: 100%;
    }

    .jacaona-workout-card:last-child {
      border-bottom: none;
    }

    .jacaona-workout-card:hover {
      background: var(--jacaona-bg-tertiary);
    }

    .jacaona-workout-card-content {
      flex: 1;
      cursor: pointer;
    }

    .jacaona-workout-menu-btn {
      background: transparent;
      border: none;
      color: var(--jacaona-text-secondary);
      cursor: pointer;
      padding: var(--jacaona-space-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--jacaona-radius-md);
      transition: all 0.15s ease;
      flex-shrink: 0;
      margin-top: -4px;
    }

    .jacaona-workout-menu-btn:hover {
      background: var(--jacaona-bg-tertiary);
      color: var(--jacaona-text-primary);
    }

    .jacaona-workout-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--jacaona-space-md);
    }

    .jacaona-workout-name {
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
      color: var(--jacaona-text-primary);
      margin: 0 0 var(--jacaona-space-xs) 0;
    }

    .jacaona-workout-description {
      font-size: 13px;
      color: var(--jacaona-text-primary);
      margin: 0 0 var(--jacaona-space-xs) 0;
      opacity: 0.85;
      line-height: 1.4;
    }

    .jacaona-workout-meta {
      font-size: 12px;
      color: var(--jacaona-text-secondary);
      margin: 0;
    }

    .jacaona-workout-preview {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jacaona-space-sm);
    }

    .jacaona-exercise-tag {
      background: var(--jacaona-bg-tertiary);
      color: var(--jacaona-text-secondary);
      padding: var(--jacaona-space-xs) var(--jacaona-space-sm);
      border-radius: var(--jacaona-radius-sm);
      font-size: 12px;
      font-weight: var(--jacaona-font-weight-medium);
    }

    .jacaona-exercise-more {
      color: var(--jacaona-text-muted);
      font-size: 12px;
      font-weight: var(--jacaona-font-weight-medium);
    }
  `]
})
export class WorkoutCardComponent {
  workout = input.required<Workout>();
  formattedDate = input.required<string>();
  duration = input.required<string>();
  menuItems = input.required<MenuItem[]>();
  
  cardClick = output<void>();
  menuAction = output<string>();
}
