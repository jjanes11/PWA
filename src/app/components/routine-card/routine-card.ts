import { Component, input, output, computed, WritableSignal } from '@angular/core';

import { Routine } from '../../models/workout.models';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';
import { CardMenuComponent, MenuItem } from '../card-menu/card-menu';

@Component({
  selector: 'app-routine-card',
  imports: [DraggableDirective, CardMenuComponent],
  template: `
    <div 
      class="jacaona-card jacaona-routine-template-card"
      [class.jacaona-drag-over]="isDragOver()"
      draggable="true"
      appDraggable
      [dragItemId]="routine().id"
      [draggedId]="draggedIdSignal()"
      [dragOverId]="dragOverIdSignal()"
      (dragReorder)="dragReorder.emit($event)"
    >
      <div class="jacaona-routine-header">
        <div class="jacaona-routine-info">
          <h3 class="jacaona-routine-name">{{ routine().name }}</h3>
          <div class="jacaona-routine-exercises">
            @for (exercise of routine().exercises; track exercise.id; let i = $index) {
              <span class="jacaona-exercise-name">{{ exercise.name }}</span>
              @if (i < routine().exercises.length - 1) {
                <span class="jacaona-exercise-separator">•</span>
              }
            }
          </div>
        </div>
        <app-card-menu 
          [menuId]="routine().id"
          [items]="menuItems()"
          (action)="menuAction.emit({routineId: routine().id, action: $event})"
        />
      </div>
      <button class="jacaona-start-routine-btn" (click)="startRoutine.emit(routine())">
        Start Routine
      </button>
    </div>
  `,
  styles: [`
    .jacaona-routine-template-card {
      display: flex;
      flex-direction: column;
      gap: var(--jacaona-space-md);
      cursor: grab;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      touch-action: pan-y;
      -webkit-user-select: none;
      user-select: none;
    }

    .jacaona-routine-template-card:active {
      cursor: grabbing;
    }

    .jacaona-routine-template-card.jacaona-drag-over {
      transform: translateY(-4px);
      box-shadow: 0 0 0 2px var(--jacaona-accent-blue);
    }

    /* Re-enable pointer events on interactive elements */
    .jacaona-routine-template-card button {
      pointer-events: auto;
      touch-action: auto;
    }

    .jacaona-routine-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--jacaona-space-sm);
    }

    .jacaona-routine-info {
      flex: 1;
    }

    .jacaona-routine-name {
      color: var(--jacaona-text-primary);
      font-size: 18px;
      font-weight: var(--jacaona-font-weight-semibold);
      margin: 0 0 var(--jacaona-space-xs) 0;
    }

    .jacaona-routine-exercises {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jacaona-space-xs);
      align-items: center;
      color: var(--jacaona-text-secondary);
      font-size: 14px;
    }

    .jacaona-exercise-name {
      color: var(--jacaona-text-secondary);
    }

    .jacaona-exercise-separator {
      color: var(--jacaona-text-tertiary);
      margin: 0 var(--jacaona-space-xs);
    }

    .jacaona-start-routine-btn {
      width: 100%;
      background: var(--jacaona-accent-blue);
      color: white;
      border: none;
      border-radius: var(--jacaona-radius-md);
      padding: var(--jacaona-space-md);
      font-size: 16px;
      font-weight: var(--jacaona-font-weight-semibold);
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .jacaona-start-routine-btn:hover {
      background: var(--jacaona-accent-blue-hover);
    }
  `]
})
export class RoutineCardComponent {
  routine = input.required<Routine>();
  draggedIdSignal = input.required<WritableSignal<string | null>>();
  dragOverIdSignal = input.required<WritableSignal<string | null>>();
  menuItems = input.required<MenuItem[]>();
  
  startRoutine = output<Routine>();
  menuAction = output<{routineId: string, action: string}>();
  dragReorder = output<DragReorderEvent>();
  
  isDragOver = computed(() => this.dragOverIdSignal()() === this.routine().id);
}
