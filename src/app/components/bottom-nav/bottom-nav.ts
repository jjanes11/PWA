import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [],
  template: `
    <nav class="jacaona-bottom-nav">
      <div class="jacaona-bottom-nav__items">
        <button 
          class="jacaona-bottom-nav__item" 
          [class.jacaona-bottom-nav__item--active]="activeTab() === 'home'"
          (click)="navigateToTab('home')"
        >
          <div class="jacaona-bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span class="jacaona-bottom-nav__label">Home</span>
        </button>
        
        <button 
          class="jacaona-bottom-nav__item" 
          [class.jacaona-bottom-nav__item--active]="activeTab() === 'start-workout'"
          (click)="navigateToTab('start-workout')"
        >
          <div class="jacaona-bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <span class="jacaona-bottom-nav__label">Workout</span>
        </button>
        
        <button 
          class="jacaona-bottom-nav__item" 
          [class.jacaona-bottom-nav__item--active]="activeTab() === 'analytics'"
          (click)="navigateToTab('analytics')"
        >
          <div class="jacaona-bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
            </svg>
          </div>
          <span class="jacaona-bottom-nav__label">Analytics</span>
        </button>
        
        <button 
          class="jacaona-bottom-nav__item" 
          [class.jacaona-bottom-nav__item--active]="activeTab() === 'settings'"
          (click)="navigateToTab('settings')"
        >
          <div class="jacaona-bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </div>
          <span class="jacaona-bottom-nav__label">Settings</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .jacaona-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--jacaona-bg-secondary);
      z-index: var(--jacaona-z-dropdown);
      padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
    }

    .jacaona-bottom-nav__items {
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 600px;
      margin: 0 auto;
      padding: 0 var(--jacaona-space-lg);
    }

    .jacaona-bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--jacaona-space-sm);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      border-radius: var(--jacaona-radius-md);
      color: var(--jacaona-text-muted);
      min-width: 56px;
      position: relative;
    }

    .jacaona-bottom-nav__item:hover {
      color: var(--jacaona-text-secondary);
    }

    .jacaona-bottom-nav__item--active {
      color: var(--jacaona-accent-blue) !important;
    }

    .jacaona-bottom-nav__icon {
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .jacaona-bottom-nav__label {
      font-size: 11px;
      font-weight: var(--jacaona-font-weight-medium);
      line-height: 1;
    }

    @media (max-width: 480px) {
      .jacaona-bottom-nav__items {
        padding: 0 var(--jacaona-space-md);
      }
      
      .jacaona-bottom-nav__item {
        min-width: 48px;
      }
      
      .jacaona-bottom-nav__label {
        font-size: 10px;
      }
    }
  `]
})
export class BottomNavComponent {
  private router = inject(Router);
  activeTab = signal('home');

  constructor() {
    this.updateActiveTabFromRoute();
    
    // Listen for navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTabFromRoute();
    });
  }

  navigateToTab(tab: string) {
    this.activeTab.set(tab); // Update immediately for instant feedback
    this.router.navigate([`/${tab}`]);
  }

  private updateActiveTabFromRoute() {
    const currentRoute = this.router.url.substring(1) || 'home';
    
    if (currentRoute.includes('home')) {
      this.activeTab.set('home');
    } else if (currentRoute.includes('start-workout')) {
      this.activeTab.set('start-workout');
    } else if (currentRoute.includes('analytics') || currentRoute.includes('calendar')) {
      this.activeTab.set('analytics');
    } else if (currentRoute.includes('settings')) {
      this.activeTab.set('settings');
    } else {
      this.activeTab.set('home');
    }
  }
}
