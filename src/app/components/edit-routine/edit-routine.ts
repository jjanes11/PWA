import { Component, inject, effect, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Routine, WorkoutSource } from '../../models/workout.models';
import { RoutineService } from '../../services/routine.service';
import { SetTypeMenuComponent } from '../set-type-menu/set-type-menu';
import { ExerciseActionEvent } from '../exercise-card/exercise-card';
import { DragReorderEvent } from '../../directives/draggable.directive';
import { ExerciseListEditorComponent } from '../exercise-list-editor/exercise-list-editor';
import { EditorButtons, EmptyStates } from '../../utils/editor-button-configs';
import { useWorkoutEntityEditor } from '../../utils/workout-entity-editor';
import { useEntityLoader } from '../../utils/entity-loader';
import { DialogService } from '../../services/dialog.service';
import { AddExerciseDialogComponent } from '../add-exercise-dialog/add-exercise-dialog';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [FormsModule, SetTypeMenuComponent, ExerciseListEditorComponent],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent {
  private router = inject(Router);
  private routineService = inject(RoutineService);
  private dialogService = inject(DialogService);
  
  // Use entity loader to handle route params and loading
  private entityLoader = useEntityLoader<Routine>({
    loadEntity: (id) => this.routineService.findRoutineById(id),
    onNotFound: () => this.router.navigate(['/workouts'])
  });
  
  routine = this.entityLoader.entity;
  title = signal('');

  constructor() {
    // Update title when routine loads
    effect(() => {
      const r = this.routine();
      if (r) {
        this.title.set(r.name);
      }
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
    const routine = this.routine();
    if (!routine) return;
    
    this.dialogService
      .open(AddExerciseDialogComponent, { 
        data: { entity: routine },
        fullScreen: true
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // User added exercises - update and save routine
          this.routine.set(result as Routine);
          this.routineService.saveRoutine(result as Routine);
        }
      });
  }

  onExerciseAction(event: ExerciseActionEvent): void {
    this.entityEditor.onExerciseAction(event);
  }

  onExerciseReorder(event: DragReorderEvent): void {
    this.entityEditor.onExerciseReorder(event);
  }
}
