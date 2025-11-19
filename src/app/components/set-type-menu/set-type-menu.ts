import { 
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  signal,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutEditorService } from '../../services/workout-editor.service';
import { BottomSheetDialog } from '../bottom-sheet-dialog/bottom-sheet-dialog';
import { Workout, Routine, SetType } from '../../models/workout.models';

@Component({
  selector: 'app-set-type-menu',
  standalone: true,
  imports: [CommonModule, BottomSheetDialog],
  templateUrl: './set-type-menu.html',
  styleUrl: './set-type-menu.css'
})
export class SetTypeMenuComponent {
  @Input({ required: true }) workout!: Workout | Routine;
  @Input({ required: true }) exerciseId!: string;
  @Input({ required: true }) setId!: string;
  @Output() workoutUpdated = new EventEmitter<Workout | Routine>();
  @Output() closed = new EventEmitter<void>();
  
  private workoutEditor = inject(WorkoutEditorService);
  protected isOpen = signal(true); // Opens immediately when component is created
  
  // Expose enum to template
  protected readonly SetType = SetType;
  
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
