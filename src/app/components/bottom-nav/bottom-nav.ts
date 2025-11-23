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
          [class.jacaona-bottom-nav__item--active]="activeTab() === 'profile'"
          (click)="navigateToTab('profile')"
        >
          <div class="jacaona-bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span class="jacaona-bottom-nav__label">Profile</span>
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
    } else if (currentRoute.includes('analytics')) {
      this.activeTab.set('analytics');
    } else if (currentRoute.includes('profile')) {
      this.activeTab.set('profile');
    } else {
      this.activeTab.set('home');
    }
  }
}
