import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { WorkoutListComponent } from '../workout-list/workout-list';
import { WorkoutService } from '../../services/workout.service';
import { MenuItem } from '../card-menu/card-menu';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [TopBarComponent, WorkoutListComponent],
  templateUrl: './calendar-day.html',
  styleUrl: './calendar-day.css'
})
export class CalendarDayComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  workouts = this.workoutService.workoutsSignal();
  dateStr = signal<string>('');

  menuItems: MenuItem[] = [
    {
      action: 'save-routine',
      icon: 'M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z',
      text: 'Save as Routine'
    },
    {
      action: 'edit',
      icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      text: 'Edit Workout'
    },
    {
      action: 'delete',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      text: 'Delete Workout',
      danger: true
    }
  ];

  constructor() {
    const date = this.route.snapshot.paramMap.get('date');
    if (date) {
      this.dateStr.set(date);
    }
  }

  // Get workouts for the specific date
  dayWorkouts = computed(() => {
    const dateStr = this.dateStr();
    if (!dateStr) return [];

    const workouts = this.workouts();
    return workouts.filter(w => {
      if (!w.completed) return false;
      const workoutDate = new Date(w.date);
      const workoutDateStr = `${workoutDate.getFullYear()}-${String(workoutDate.getMonth() + 1).padStart(2, '0')}-${String(workoutDate.getDate()).padStart(2, '0')}`;
      return workoutDateStr === dateStr;
    });
  });

  returnUrl = computed(() => `/calendar-day/${this.dateStr()}`);

  formattedDate = computed(() => {
    const dateStr = this.dateStr();
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });

  goBack(): void {
    this.router.navigate(['/calendar']);
  }

  onLogWorkout(): void {
    const date = this.dateStr();
    this.router.navigate(['/edit-workout/new'], {
      queryParams: { 
        date: date,
        returnUrl: `/calendar-day/${date}`
      }
    });
  }
}
