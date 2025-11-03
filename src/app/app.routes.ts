import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'workout/new', 
    loadComponent: () => import('./components/add-workout/add-workout').then(m => m.AddWorkoutComponent)
  },
  { 
    path: 'add-exercise', 
    loadComponent: () => import('./components/add-exercise/add-exercise').then(m => m.AddExercise)
  },
  { 
    path: 'create-exercise', 
    loadComponent: () => import('./components/create-exercise/create-exercise').then(m => m.CreateExercise)
  },
  { 
    path: 'save-workout', 
    loadComponent: () => import('./components/save-workout/save-workout').then(m => m.SaveWorkoutComponent)
  },
  { 
    path: 'edit-workout/:id', 
    loadComponent: () => import('./components/edit-workout/edit-workout').then(m => m.EditWorkoutComponent)
  },
  { 
    path: 'routine/new', 
    loadComponent: () => import('./components/create-routine/create-routine').then(m => m.CreateRoutineComponent)
  },
  { 
    path: 'routine/edit/:id', 
    loadComponent: () => import('./components/edit-routine/edit-routine').then(m => m.EditRoutineComponent)
  },
  { 
    path: 'home', 
    loadComponent: () => import('./components/workout-dashboard/workout-dashboard').then(m => m.WorkoutDashboardComponent)
  },
  { 
    path: 'workouts', 
    loadComponent: () => import('./components/workout-list/workout-list').then(m => m.WorkoutListComponent)
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./components/workout-dashboard/workout-dashboard').then(m => m.WorkoutDashboardComponent) // Temporary placeholder
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/workout-dashboard/workout-dashboard').then(m => m.WorkoutDashboardComponent) // Temporary placeholder
  },
  { 
    path: 'workout/:id', 
    loadComponent: () => import('./components/workout-detail/workout-detail').then(m => m.WorkoutDetailComponent)
  },
  { path: '**', redirectTo: '/home' }
];
