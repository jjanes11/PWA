import { Component, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { ExerciseChartComponent } from '../exercise-chart/exercise-chart';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [TopBarComponent, ExerciseChartComponent],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.css'
})
export class ExerciseDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  exerciseName = signal<string>('');

  constructor() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.exerciseName.set(decodeURIComponent(name));
    }
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }
}
