import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Routine, WorkoutSource } from '../../models/workout.models';
import { RoutineService } from '../../services/routine.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { ExerciseListEditorComponent } from '../exercise-list-editor/exercise-list-editor';
import { useCleanupContext } from '../../utils/navigation-context';
import { EditorButtons, EmptyStates } from '../../utils/editor-button-configs';
import { useWorkoutEntityEditor } from '../../utils/workout-entity-editor';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private routineService = inject(RoutineService);
  private cleanup = useCleanupContext();
  
  // Get routine ID from route params
  private routineId = toSignal(
    this.route.params.pipe(map(params => params['id']))
  );
  
  routine = signal<Routine | null>(null);
  title = signal('');

  constructor() {
    // Load routine when ID changes
    effect(() => {
      const id = this.routineId();
      if (!id) {
        this.router.navigate(['/workouts']);
        return;
      }

      const routine = this.routineService.findRoutineById(id);
      if (!routine) {
        // Routine was deleted, redirect
        this.router.navigate(['/workouts']);
        return;
      }

      this.routine.set(routine);
      this.title.set(routine.name);
    });
  }
  
  // Entity editor provides all exercise editing functionality
  private entityEditor = useWorkoutEntityEditor<Routine>({
    getEntity: () => this.routine(),
    onEntityUpdated: (routine) => {
      this.routine.set(routine);
      this.routineService.saveRoutine(routine);
    },
    source: WorkoutSource.PersistedRoutine,
    getTitle: () => this.title(),
    returnUrl: '/workouts'
  });
  
  // Expose editor properties for template
  draggedExerciseId = this.entityEditor.draggedExerciseId;
  dragOverExerciseId = this.entityEditor.dragOverExerciseId;
  menuItems = this.entityEditor.menuItems;
  showSetTypeMenu = this.entityEditor.showSetTypeMenu;
  selectedSet = this.entityEditor.selectedSet;
  headerLeftButton = EditorButtons.cancel();
  headerRightButton = EditorButtons.update();
  bottomPrimaryButton = EditorButtons.addExercisePlus('secondary');
  emptyState = EmptyStates.editRoutine();

  closeSetTypeMenu(): void {
    this.entityEditor.closeSetTypeMenu();
  }

  onRoutineUpdated(routine: Routine): void {
    this.entityEditor.onEntityUpdated(routine);
  }

  cancel(): void {
    this.entityEditor.cancel();
  }

  update(): void {
    this.entityEditor.save();
  }

  addExercise(): void {
    this.entityEditor.navigateToAddExercise();
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }
}
