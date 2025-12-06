import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { DataExportService } from '../../services/data-export.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TopBarComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private router = inject(Router);
  private dataExportService = inject(DataExportService);
  private storageService = inject(StorageService);

  isExporting = signal(false);
  isImporting = signal(false);
  showImportDialog = signal(false);
  showClearDialog = signal(false);
  pendingFile = signal<File | null>(null);
  lastAction = signal<{ type: 'export' | 'import'; message: string } | null>(null);

  goBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Export all data to JSON file
   */
  async exportData(): Promise<void> {
    try {
      this.isExporting.set(true);
      this.lastAction.set(null);
      
      this.dataExportService.downloadExport();
      
      this.lastAction.set({
        type: 'export',
        message: 'Data exported successfully'
      });
    } catch (error) {
      this.lastAction.set({
        type: 'export',
        message: 'Export failed. Please try again.'
      });
    } finally {
      this.isExporting.set(false);
    }
  }

  /**
   * Trigger file picker for import
   */
  importData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      await this.processImportFile(file);
    };
    
    input.click();
  }

  /**
   * Process imported file
   */
  private async processImportFile(file: File): Promise<void> {
    this.pendingFile.set(file);
    this.showImportDialog.set(true);
  }

  /**
   * Confirm import with replace strategy
   */
  async confirmReplaceImport(): Promise<void> {
    const file = this.pendingFile();
    if (!file) return;

    this.showImportDialog.set(false);
    await this.performImport(file, false);
  }

  /**
   * Confirm import with merge strategy
   */
  async confirmMergeImport(): Promise<void> {
    const file = this.pendingFile();
    if (!file) return;

    this.showImportDialog.set(false);
    await this.performImport(file, true);
  }

  /**
   * Cancel import
   */
  cancelImport(): void {
    this.showImportDialog.set(false);
    this.pendingFile.set(null);
    this.isImporting.set(false);
  }

  /**
   * Perform the actual import
   */
  private async performImport(file: File, merge: boolean): Promise<void> {
    try {
      this.isImporting.set(true);
      this.lastAction.set(null);

      const importResult = await this.dataExportService.importFromFile(file, { merge });

      if (importResult.success && importResult.imported) {
        this.lastAction.set({
          type: 'import',
          message: `Successfully imported: ${importResult.imported.workouts} workouts, ${importResult.imported.routines} routines, ${importResult.imported.exercises} custom exercises`
        });

        // Reload the page to reflect imported data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.lastAction.set({
          type: 'import',
          message: `Import failed: ${importResult.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      this.lastAction.set({
        type: 'import',
        message: 'Import failed. Please check the file format.'
      });
    } finally {
      this.isImporting.set(false);
      this.pendingFile.set(null);
    }
  }

  /**
   * Clear success/error message
   */
  clearMessage(): void {
    this.lastAction.set(null);
  }

  /**
   * Show clear all data confirmation dialog
   */
  clearAllData(): void {
    this.showClearDialog.set(true);
  }

  /**
   * Confirm and execute clear all data
   */
  async confirmClearData(): Promise<void> {
    try {
      this.showClearDialog.set(false);
      
      // Clear all localStorage data
      await this.storageService.clearAllData();
      
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      this.lastAction.set({
        type: 'export',
        message: 'All data cleared successfully. Reloading app...'
      });

      // Reload after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      this.lastAction.set({
        type: 'import',
        message: 'Failed to clear data. Please try again.'
      });
    }
  }

  /**
   * Cancel clear all data
   */
  cancelClearData(): void {
    this.showClearDialog.set(false);
  }

  /**
   * Navigate to Developer Tools
   */
  goToDevTools(): void {
    this.router.navigate(['/dev-tools']);
  }
}
