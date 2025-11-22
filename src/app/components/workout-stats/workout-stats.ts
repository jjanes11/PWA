import { Component, input } from '@angular/core';

export interface WorkoutStatsData {
  duration: string;
  volume: number;
  sets: number;
}

@Component({
  selector: 'app-workout-stats',
  standalone: true,
  template: `
    <div class="jacaona-flex jacaona-gap-lg" style="margin-bottom: var(--jacaona-space-xl);">
      <div class="jacaona-stat-item">
        <div class="jacaona-stat-label">Duration</div>
        <div class="jacaona-stat-value jacaona-stat-primary">{{ stats().duration }}</div>
      </div>
      <div class="jacaona-stat-item">
        <div class="jacaona-stat-label">Volume</div>
        <div class="jacaona-stat-value">{{ stats().volume }} kg</div>
      </div>
      <div class="jacaona-stat-item">
        <div class="jacaona-stat-label">Sets</div>
        <div class="jacaona-stat-value">{{ stats().sets }}</div>
      </div>
    </div>
  `,
  styles: [`
    .jacaona-stat-item {
      flex: 1;
      text-align: center;
    }

    .jacaona-stat-label {
      color: var(--jacaona-text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--jacaona-space-xs);
    }

    .jacaona-stat-value {
      color: var(--jacaona-text-primary);
      font-size: 24px;
      font-weight: 700;
    }

    .jacaona-stat-primary {
      color: var(--jacaona-accent-blue);
    }

    @media (max-width: 768px) {
      .jacaona-stats-row {
        gap: var(--jacaona-space-md);
      }

      .jacaona-stat-value {
        font-size: 20px;
      }
    }
  `]
})
export class WorkoutStatsComponent {
  stats = input.required<WorkoutStatsData>();
}
