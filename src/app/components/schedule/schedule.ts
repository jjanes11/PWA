import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  time: string;
  workoutId?: string;
  workoutName?: string;
}

interface DaySchedule {
  day: string;
  date: Date;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-schedule',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class ScheduleComponent {
  currentWeek = signal(new Date());
  showScheduleModal = signal(false);
  selectedDay = signal('');
  selectedTime = signal('');
  selectedDate = signal<Date | null>(null);
  newWorkoutName = '';

  timeSlots = signal(['06:00', '07:00', '08:00', '18:00', '19:00', '20:00']);
  presetWorkouts = signal(['Push Day', 'Pull Day', 'Leg Day', 'Cardio', 'Full Body']);

  weekSchedule = computed(() => {
    const week = this.currentWeek();
    const startOfWeek = new Date(week);
    startOfWeek.setDate(week.getDate() - week.getDay()); // Sunday as start

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      return {
        day,
        date,
        slots: this.timeSlots().map(time => ({
          time,
          workoutId: this.getScheduledWorkout(date, time)?.id,
          workoutName: this.getScheduledWorkout(date, time)?.name
        }))
      };
    });
  });

  weekLabel = computed(() => {
    const week = this.currentWeek();
    const startOfWeek = new Date(week);
    startOfWeek.setDate(week.getDate() - week.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
  });

  previousWeek() {
    const prevWeek = new Date(this.currentWeek());
    prevWeek.setDate(prevWeek.getDate() - 7);
    this.currentWeek.set(prevWeek);
  }

  nextWeek() {
    const nextWeek = new Date(this.currentWeek());
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.currentWeek.set(nextWeek);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getSlot(day: DaySchedule, time: string): TimeSlot | undefined {
    return day.slots.find(slot => slot.time === time);
  }

  toggleSlot(day: DaySchedule, time: string) {
    const slot = this.getSlot(day, time);
    if (slot?.workoutId) {
      // Remove scheduled workout
      this.removeScheduledWorkout(day.date, time);
    } else {
      // Open schedule modal
      this.selectedDay.set(day.day);
      this.selectedTime.set(time);
      this.selectedDate.set(day.date);
      this.showScheduleModal.set(true);
    }
  }

  selectPreset(preset: string) {
    this.newWorkoutName = preset;
  }

  saveScheduledWorkout() {
    if (this.newWorkoutName.trim() && this.selectedDate()) {
      // Save to localStorage
      const scheduleKey = this.getScheduleKey(this.selectedDate()!, this.selectedTime());
      localStorage.setItem(scheduleKey, JSON.stringify({
        id: Date.now().toString(),
        name: this.newWorkoutName.trim(),
        day: this.selectedDay(),
        time: this.selectedTime(),
        date: this.selectedDate()!.toISOString()
      }));
      
      this.closeScheduleModal();
      // Trigger reactivity by updating current week
      this.currentWeek.set(new Date(this.currentWeek()));
    }
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
    this.newWorkoutName = '';
    this.selectedDay.set('');
    this.selectedTime.set('');
    this.selectedDate.set(null);
  }

  private getScheduledWorkout(date: Date, time: string) {
    const scheduleKey = this.getScheduleKey(date, time);
    const stored = localStorage.getItem(scheduleKey);
    return stored ? JSON.parse(stored) : null;
  }

  private removeScheduledWorkout(date: Date, time: string) {
    const scheduleKey = this.getScheduleKey(date, time);
    localStorage.removeItem(scheduleKey);
    // Trigger reactivity
    this.currentWeek.set(new Date(this.currentWeek()));
  }

  private getScheduleKey(date: Date, time: string): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `workout-schedule-${dateStr}-${time}`;
  }
}
