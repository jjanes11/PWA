import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';
import { AnalyticsChartComponent } from './analytics-chart/analytics-chart';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TopBarComponent, BottomNavComponent, AnalyticsChartComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent {
  private router = inject(Router);

  navigateToExercises() {
    this.router.navigate(['/exercises']);
  }

  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }
}
