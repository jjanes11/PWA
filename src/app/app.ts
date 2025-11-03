import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { UpdateService } from './services/update.service';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Jačaona');
  protected readonly canInstall = signal(false);
  protected readonly showUpdateBanner = signal(false);
  protected readonly showBottomNav = signal(true);
  private deferredPrompt: any;
  private updateService = inject(UpdateService); // Initialize update service
  private router = inject(Router);

  constructor() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.canInstall.set(false);
      console.log('PWA was installed');
    });

    // Listen for update banner events
    window.addEventListener('show-update-banner', () => {
      this.showUpdateBanner.set(true);
    });

    // Track route changes to show/hide bottom nav
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide bottom nav on specific workout creation and exercise pages (not the main workouts list)
        const hideNavRoutes = ['/workout/new', '/add-exercise', '/create-exercise', '/save-workout', '/routine/new'];
        // Also hide for specific workout detail pages (workout/:id pattern) and edit routine pages
        const isWorkoutDetail = event.url.match(/^\/workout\/\d+/);
        const isEditRoutine = event.url.match(/^\/routine\/edit\//);
        const isEditWorkout = event.url.match(/^\/edit-workout\//);
        const shouldHide = hideNavRoutes.includes(event.url) || !!isWorkoutDetail || !!isEditRoutine || !!isEditWorkout;
        this.showBottomNav.set(!shouldHide);
      });
  }

  async installPwa() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.canInstall.set(false);
    }
    
    this.deferredPrompt = null;
  }

  updateApp(): void {
    this.updateService.forceUpdate();
  }

  dismissUpdateBanner(): void {
    this.showUpdateBanner.set(false);
  }
}
