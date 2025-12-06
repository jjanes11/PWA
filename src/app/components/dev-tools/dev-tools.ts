import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { DataExportService } from '../../services/data-export.service';

@Component({
  selector: 'app-dev-tools',
  standalone: true,
  imports: [TopBarComponent],
  templateUrl: './dev-tools.html',
  styleUrl: './dev-tools.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevToolsComponent {
  private router = inject(Router);
  private dataExportService = inject(DataExportService);

  isLoadingTestData = signal(false);
  lastAction = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * Load test data from GitHub
   * Uses the sample-workout-data.json file
   */
  async loadTestData(): Promise<void> {
    try {
      this.isLoadingTestData.set(true);
      this.lastAction.set(null);

      // Fetch test data from GitHub raw content
      const response = await fetch(
        'https://raw.githubusercontent.com/jjanes11/jacaona/main/test-data/sample-workout-data.json'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }

      const testData = await response.json();

      // Import the test data (replace existing data)
      const importResult = await this.dataExportService.importData(
        JSON.stringify(testData),
        { merge: false }
      );

      if (importResult.success && importResult.imported) {
        this.lastAction.set({
          type: 'success',
          message: `Test data loaded! ${importResult.imported.workouts} workouts imported. Reloading...`
        });

        // Reload to show imported data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.lastAction.set({
          type: 'error',
          message: `Failed to load test data: ${importResult.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      this.lastAction.set({
        type: 'error',
        message: 'Failed to load test data. Check your internet connection.'
      });
    } finally {
      this.isLoadingTestData.set(false);
    }
  }

  /**
   * Clear status message
   */
  clearMessage(): void {
    this.lastAction.set(null);
  }
}
