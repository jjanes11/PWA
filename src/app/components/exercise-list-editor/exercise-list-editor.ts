import { Component, EventEmitter, Input, Output, WritableSignal, signal } from '@angular/core';

import { Workout, Routine, Exercise } from '../../models/workout.models';
import { ExerciseCardComponent, ExerciseActionEvent, ExerciseCardMode } from '../exercise-card/exercise-card';
import { MenuItem } from '../card-menu/card-menu';
import { DraggableDirective, DragReorderEvent } from '../../directives/draggable.directive';

export interface EditorButtonConfig {
  label?: string;
  iconPath?: string;
  ariaLabel?: string;
  variant?: 'icon' | 'ghost' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface BottomButtonConfig {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface ExerciseListEditorEmptyState {
  iconPath?: string;
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-exercise-list-editor',
  standalone: true,
  imports: [ExerciseCardComponent, DraggableDirective],
  templateUrl: './exercise-list-editor.html',
  styleUrl: './exercise-list-editor.css'
})
export class ExerciseListEditorComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() workout: Workout | Routine | null = null;
  @Input() exerciseMode: ExerciseCardMode = 'edit';
  @Input() showMenu = false;
  @Input() showAddSetButton = false;
  @Input() showCompleteColumn = false;
  @Input() menuItems: MenuItem[] = [];
  @Input() enableReorder = false;
  @Input() draggedId?: WritableSignal<string | null>;
  @Input() dragOverId?: WritableSignal<string | null>;
  @Input() leftButton?: EditorButtonConfig;
  @Input() rightButton?: EditorButtonConfig;
  @Input() bottomPrimary?: BottomButtonConfig;
  @Input() bottomSecondary?: BottomButtonConfig;
  @Input() emptyState?: ExerciseListEditorEmptyState;
  @Input() loading = false;
  @Input() exerciseTrackBy: (exercise: Exercise) => string = (exercise) => exercise.id;

  @Output() leftAction = new EventEmitter<void>();
  @Output() rightAction = new EventEmitter<void>();
  @Output() bottomPrimaryAction = new EventEmitter<void>();
  @Output() bottomSecondaryAction = new EventEmitter<void>();
  @Output() exerciseAction = new EventEmitter<ExerciseActionEvent>();
  @Output() exerciseReorder = new EventEmitter<DragReorderEvent>();

  private readonly fallbackDraggedId = signal<string | null>(null);
  private readonly fallbackDragOverId = signal<string | null>(null);

  hasExercises(): boolean {
    return !!this.workout && this.workout.exercises.length > 0;
  }

  get resolvedDraggedId(): WritableSignal<string | null> {
    return this.draggedId ?? this.fallbackDraggedId;
  }

  get resolvedDragOverId(): WritableSignal<string | null> {
    return this.dragOverId ?? this.fallbackDragOverId;
  }

  isDragOver(exerciseId: string): boolean {
    return this.resolvedDragOverId() === exerciseId;
  }

  isDragging(exerciseId: string): boolean {
    return this.resolvedDraggedId() === exerciseId;
  }

  onLeftClick(): void {
    if (!this.leftButton?.disabled) {
      this.leftAction.emit();
    }
  }

  onRightClick(): void {
    if (!this.rightButton?.disabled) {
      this.rightAction.emit();
    }
  }

  triggerBottomPrimary(): void {
    if (!this.bottomPrimary?.disabled) {
      this.bottomPrimaryAction.emit();
    }
  }

  triggerBottomSecondary(): void {
    if (!this.bottomSecondary?.disabled) {
      this.bottomSecondaryAction.emit();
    }
  }

  buttonClasses(config: EditorButtonConfig | BottomButtonConfig | undefined): string {
    if (!config) {
      return '';
    }

    const variant = config.variant || 'primary';
    switch (variant) {
      case 'icon':
        return 'editor-btn editor-btn--icon';
      case 'ghost':
        return 'editor-btn editor-btn--ghost';
      case 'secondary':
        return 'editor-btn editor-btn--secondary';
      case 'danger':
        return 'editor-btn editor-btn--danger';
      default:
        return 'editor-btn editor-btn--primary';
    }
  }

  trackExercise = (_: number, exercise: Exercise) => this.exerciseTrackBy(exercise);
}
