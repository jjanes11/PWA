import { 
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  effect,
  inject
} from '@angular/core';

import { WorkoutEditorService } from '../../services/workout-editor.service';
import { BottomMenuComponent, BottomMenuItem } from '../bottom-menu/bottom-menu';
import { SetType, WorkoutEntity } from '../../models/workout.models';

@Component({
  selector: 'app-set-type-menu',
  standalone: true,
  imports: [BottomMenuComponent],
  templateUrl: './set-type-menu.html'
})
export class SetTypeMenuComponent<T extends WorkoutEntity = WorkoutEntity> {
  @Input({ required: true }) workout!: T;
  @Input({ required: true }) exerciseId!: string;
  @Input({ required: true }) setId!: string;
  @Output() workoutUpdated = new EventEmitter<T>();
  @Output() closed = new EventEmitter<void>();
  
  private workoutEditor = inject(WorkoutEditorService);
  protected isOpen = signal(true); // Opens immediately when component is created
  
  // Expose enum to template
  protected readonly SetType = SetType;
  
  // Menu items for set types
  protected readonly menuItems: BottomMenuItem[] = [
    {
      action: 'warmup',
      icon: '', // Not used for text icons
      iconText: 'W',
      iconColor: '#facc15',
      text: 'Warm Up Set'
    },
    {
      action: 'normal',
      icon: '',
      iconText: '1',
      text: 'Normal Set'
    },
    {
      action: 'failure',
      icon: '',
      iconText: 'F',
      iconColor: 'var(--jacaona-danger)',
      text: 'Failure Set'
    },
    {
      action: 'drop',
      icon: '',
      iconText: 'D',
      iconColor: 'var(--jacaona-accent-blue)',
      text: 'Drop Set'
    },
    {
      action: 'remove',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      text: 'Remove Set',
      danger: true
    }
  ];
  
  // Static to track which menu is open globally (only one menu open at a time)
  private static openMenuId = signal<string | null>(null);

  constructor() {
    const menuId = `${this.exerciseId}-${this.setId}`;
    SetTypeMenuComponent.openMenuId.set(menuId);
    
    // Close this menu if another menu opens
    effect(() => {
      const globalOpenId = SetTypeMenuComponent.openMenuId();
      if (globalOpenId !== menuId && this.isOpen()) {
        this.closeMenu();
      }
    });
  }

  closeMenu(): void {
    this.isOpen.set(false);
    SetTypeMenuComponent.openMenuId.set(null);
    this.closed.emit();
  }

  handleMenuAction(action: string): void {
    switch (action) {
      case 'warmup':
        this.setSetType(SetType.Warmup);
        break;
      case 'normal':
        this.setSetType(SetType.Normal);
        break;
      case 'failure':
        this.setSetType(SetType.Failure);
        break;
      case 'drop':
        this.setSetType(SetType.Drop);
        break;
      case 'remove':
        this.removeSet();
        break;
    }
  }

  setSetType(type: SetType): void {
    const exercise = this.workout.exercises.find(e => e.id === this.exerciseId);
    const set = exercise?.sets.find(s => s.id === this.setId);
    
    if (set) {
      const updatedSet = { ...set, type };
      const updatedWorkout = this.workoutEditor.updateSet(this.workout, this.exerciseId, updatedSet);
      this.workoutUpdated.emit(updatedWorkout);
    }
    
    this.closeMenu();
  }

  removeSet(): void {
    const updatedWorkout = this.workoutEditor.removeSetFromExercise(this.workout, this.exerciseId, this.setId);
    this.workoutUpdated.emit(updatedWorkout);
    this.closeMenu();
  }
}
