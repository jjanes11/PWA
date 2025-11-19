import { EditorButtonConfig, BottomButtonConfig, ExerciseListEditorEmptyState } from '../components/exercise-list-editor/exercise-list-editor';

/**
 * Standardized button configurations for workout/routine editors.
 * Centralizes UI button definitions to ensure consistency and reduce duplication.
 */
export const EditorButtons = {
  cancel: (): EditorButtonConfig => ({ 
    label: 'Cancel', 
    variant: 'ghost' 
  }),
  
  back: (): EditorButtonConfig => ({ 
    variant: 'icon', 
    ariaLabel: 'Back',
    iconPath: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20z'
  }),
  
  save: (): EditorButtonConfig => ({ 
    label: 'Save' 
  }),
  
  update: (): EditorButtonConfig => ({ 
    label: 'Update' 
  }),
  
  finish: (): EditorButtonConfig => ({ 
    label: 'Finish' 
  }),
  
  addExercise: (variant: 'primary' | 'secondary' = 'primary'): BottomButtonConfig => ({
    label: 'Add Exercise',
    variant
  }),
  
  addExercisePlus: (variant: 'primary' | 'secondary' = 'secondary'): BottomButtonConfig => ({
    label: '+ Add exercise',
    variant
  }),
  
  discardWorkout: (): BottomButtonConfig => ({
    label: 'Discard Workout',
    variant: 'danger'
  })
};

/**
 * Standard menu item icon paths for exercise cards
 */
export const MenuIcons = {
  replace: 'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z',
  
  remove: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  
  dumbbell: 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',
  
  barChart: 'M3 10h2v4H3v-4Zm3-3h2v10H6V7Zm12 0h-2v10h2V7Zm3 3h-2v4h2v-4ZM9 11h6v2H9v-2Z'
};

/**
 * Standardized empty state configurations for exercise lists.
 */
export const EmptyStates = {
  addWorkout: (): ExerciseListEditorEmptyState => ({
    iconPath: MenuIcons.dumbbell,
    title: 'Get started',
    message: 'Add your first exercise to build this workout.'
  }),
  
  editWorkout: (): ExerciseListEditorEmptyState => ({
    iconPath: MenuIcons.barChart,
    title: 'No exercises yet',
    message: 'Add an exercise to continue editing this workout.'
  }),
  
  createRoutine: (): ExerciseListEditorEmptyState => ({
    iconPath: MenuIcons.barChart,
    title: 'No exercises yet',
    message: 'Add exercises to build your routine.'
  }),
  
  editRoutine: (): ExerciseListEditorEmptyState => ({
    iconPath: MenuIcons.barChart,
    title: 'No exercises yet',
    message: 'Add exercises to update this routine.'
  })
};
