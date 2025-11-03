import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.checkForUpdates();
      this.handleUpdates();
    }
  }

  private checkForUpdates(): void {
    // Check for updates every 6 hours
    setInterval(() => {
      this.swUpdate.checkForUpdate().then(() => {
        console.log('Checked for app updates');
      });
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  private handleUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.promptUserToUpdate();
      });
  }

  private promptUserToUpdate(): void {
    const updateMessage = `
🆕 New workout tracker version available! 

What's new:
• Bug fixes and improvements
• Better performance
• Enhanced features

Update now?`;

    if (confirm(updateMessage)) {
      this.activateUpdate();
    } else {
      // Show a less intrusive notification
      this.showUpdateBanner();
    }
  }

  private activateUpdate(): void {
    this.swUpdate.activateUpdate().then(() => {
      // Reload to get the new version
      window.location.reload();
    });
  }

  private showUpdateBanner(): void {
    // Create update banner (we'll implement this in the app component)
    const event = new CustomEvent('show-update-banner');
    window.dispatchEvent(event);
  }

  // Manual update check (for settings page later)
  public checkForUpdateManually(): Promise<boolean> {
    return this.swUpdate.checkForUpdate();
  }

  public forceUpdate(): void {
    this.activateUpdate();
  }
}