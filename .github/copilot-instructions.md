# Angular PWA Project Instructions

This is an Angular Progressive Web App (PWA) project configured for automatic deployment to GitHub Pages.

## Project Overview
- **Type**: Angular PWA (Progressive Web App)
- **Framework**: Angular 20.3.x with zoneless architecture
- **Styling**: CSS
- **Deployment**: GitHub Actions → GitHub Pages
- **Features**: Service Worker, Web App Manifest, Offline Support, Installable

## Architecture
- **Standalone Components**: Uses Angular standalone components (no NgModule)
- **Zoneless**: Configured without zone.js for better performance
- **PWA**: Full PWA capabilities with service worker and manifest
- **Routing**: Angular Router configured
- **Build**: Vite-based build system

## Development Guidelines
- Follow Angular best practices and style guide
- Use standalone components for new features
- Leverage PWA capabilities (offline, caching, installability)
- Maintain responsive design principles
- Test PWA features in DevTools

## Build & Deployment
- **Local**: `npm start` for development
- **Production**: `npm run build` 
- **Output**: `dist/jacaona-app/browser/`
- **Auto Deploy**: GitHub Actions on push to main branch
- **Live URL**: `https://yourusername.github.io/jacaona/`

## Key Files
- `src/app/`: Main application components
- `public/manifest.webmanifest`: PWA manifest
- `ngsw-config.json`: Service worker configuration
- `.github/workflows/deploy.yml`: Deployment automation
- `public/icons/`: PWA icons (multiple sizes)

---

## 🎨 UI Component Development Standards

### Component Architecture Principles

#### 1. Atomic Design Methodology
Follow atomic design principles for component composition:

- **Atoms** (Smallest building blocks)
  - Single-purpose components (e.g., buttons, inputs, icons)
  - No dependencies on other components
  - Highly reusable across the application
  - Example: `StatCardComponent`, `TopBarComponent`

- **Molecules** (Simple component groups)
  - Combination of 2-3 atoms
  - Serve a single, clear purpose
  - Example: `WorkoutTitleInputComponent` (label + input)

- **Organisms** (Complex component sections)
  - Groups of molecules forming distinct sections
  - Example: `WorkoutStatsComponent`, `RoutineCardComponent`

- **Templates** (Page layouts)
  - Arrangement of organisms
  - Define content structure without actual data
  - Example: Page containers with header/content/footer

- **Pages** (Full views)
  - Complete views with real data
  - Example: `HomeComponent`, `StartWorkoutComponent`

#### 2. Component Extraction Rules

**✅ EXTRACT a component when:**
- Used in **2+ different places** (proven duplication)
- Template exceeds **40-50 lines** (complex logic)
- Has **clear single responsibility** (does one thing well)
- Contains **reusable UI patterns** (cards, dialogs, forms)
- Encapsulates **significant state/logic** (non-trivial behavior)

**❌ DON'T extract when:**
- **Single use only** (no duplication yet)
- **Simple structure** (<15 lines of HTML)
- **Tightly coupled** to parent context (can't be reused)
- **Premature optimization** (no clear benefit)

**Example of good extraction:**
```typescript
// ✅ GOOD: Reusable stat display (used 4 times)
@Component({
  selector: 'app-stat-card',
  template: `
    <div class="jacaona-stat">
      <svg class="jacaona-stat__icon" [style.color]="iconColor()">...</svg>
      <div class="jacaona-stat__value">{{ value() }}</div>
      <div class="jacaona-stat__label">{{ label() }}</div>
    </div>
  `,
  styles: [`...`]
})
export class StatCardComponent {
  value = input.required<number>();
  label = input.required<string>();
  color = input<'blue' | 'green' | 'yellow' | 'red'>('blue');
  // ...
}
```

**Example of premature extraction:**
```typescript
// ❌ BAD: Single-use button that belongs inline
@Component({
  selector: 'app-start-empty-workout-button', // Overly specific
  template: `<button>Start Empty Workout</button>`
})
export class StartEmptyWorkoutButtonComponent {} // Unnecessary abstraction
```

### CSS Architecture Standards

#### 1. BEM Naming Convention (Block Element Modifier)
Use BEM for all component-specific CSS classes:

```css
/* Block: standalone entity */
.jacaona-workout-card { }

/* Element: part of a block */
.jacaona-workout-card__header { }
.jacaona-workout-card__title { }
.jacaona-workout-card__menu-btn { }
.jacaona-workout-card__exercises { }

/* Modifier: different state or variation */
.jacaona-workout-card--active { }
.jacaona-workout-card--dragging { }
.jacaona-workout-card__menu-btn--disabled { }
```

**BEM Rules:**
- **Block**: `.jacaona-[component-name]`
- **Element**: `.jacaona-[component-name]__[element]`
- **Modifier**: `.jacaona-[component-name]--[state]` or `.jacaona-[component-name]__[element]--[state]`
- Use **double underscores** for elements (`__`)
- Use **double hyphens** for modifiers (`--`)
- Always prefix with `jacaona-` namespace

#### 2. CSS Scoping Strategy

**Component-Scoped CSS** (Default for most components):
```typescript
@Component({
  selector: 'app-workout-card',
  templateUrl: './workout-card.html',
  styles: [`
    /* These styles are SCOPED to this component only */
    .jacaona-workout-card {
      background: var(--jacaona-bg-secondary);
      border-radius: var(--jacaona-radius-lg);
    }
  `]
})
```

**Global CSS** (Only for truly shared patterns):
- **Design tokens**: `src/styles/tokens.css` (colors, spacing, typography)
- **Base styles**: `src/styles/base.css` (resets, HTML elements)
- **Utilities**: `src/styles/utilities.css` (flex, spacing, text helpers)
- **Shared components**: `src/styles/components.css` (dialogs, buttons used everywhere)

**When to use inline styles vs separate CSS file:**
- **Inline** (`styles: []`): Small components (<100 lines CSS)
- **Separate file** (`styleUrl: './component.css'`): Large components (>100 lines CSS)

#### 3. Design Token Usage
Always use CSS variables for consistency:

```css
/* ✅ GOOD: Use design tokens */
.jacaona-button {
  background: var(--jacaona-accent-blue);
  color: var(--jacaona-text-primary);
  padding: var(--jacaona-space-md);
  border-radius: var(--jacaona-radius-md);
  font-size: var(--jacaona-font-size-base);
  transition: var(--jacaona-transition-fast);
}

/* ❌ BAD: Hardcoded values */
.jacaona-button {
  background: #2196F3;
  color: white;
  padding: 12px;
  border-radius: 8px;
}
```

**Available Token Categories:**
- Colors: `--jacaona-accent-*`, `--jacaona-bg-*`, `--jacaona-text-*`, `--jacaona-border`
- Spacing: `--jacaona-space-{xs,sm,md,lg,xl,2xl,3xl}`
- Typography: `--jacaona-font-size-*`, `--jacaona-font-weight-*`
- Borders: `--jacaona-radius-{sm,md,lg,xl}`
- Transitions: `--jacaona-transition-{fast,base,slow}`
- Shadows: `--jacaona-shadow-{sm,md,lg}`
- Z-index: `--jacaona-z-{dropdown,sticky,fixed,modal,popover,tooltip}`

#### 4. Utility-First Approach (Where Appropriate)
Use utility classes for common patterns to reduce CSS duplication:

```html
<!-- ✅ GOOD: Use utilities for common layouts -->
<div class="jacaona-flex jacaona-items-center jacaona-gap-md">
  <div class="jacaona-mb-lg jacaona-text-secondary">...</div>
</div>

<!-- ❌ BAD: Custom CSS for every layout -->
<div class="custom-flex-container">
  <div class="custom-spaced-item">...</div>
</div>
```

**Available Utility Classes:**
- **Flexbox**: `.jacaona-flex`, `.jacaona-flex-col`, `.jacaona-items-center`, `.jacaona-justify-between`
- **Spacing**: `.jacaona-m{t,r,b,l,x,y}-{xs,sm,md,lg,xl,2xl}`, `.jacaona-p{...}`
- **Typography**: `.jacaona-text-{xs,sm,base,lg,xl,2xl}`, `.jacaona-font-{normal,medium,semibold,bold}`
- **Display**: `.jacaona-hidden`, `.jacaona-block`, `.jacaona-w-full`, `.jacaona-h-full`

### Template (HTML) Best Practices

#### 1. Semantic HTML
Use appropriate HTML elements for accessibility:

```html
<!-- ✅ GOOD: Semantic structure -->
<header class="jacaona-header">
  <h1 class="jacaona-title">Dashboard</h1>
  <nav class="jacaona-nav">...</nav>
</header>

<main class="jacaona-main">
  <section class="jacaona-stats">...</section>
  <article class="jacaona-workout-card">...</article>
</main>

<!-- ❌ BAD: Div soup -->
<div class="jacaona-header">
  <div class="jacaona-title">Dashboard</div>
  <div class="jacaona-nav">...</div>
</div>
```

#### 2. Control Flow Syntax (Angular 17+)
Use new `@if`, `@for`, `@switch` syntax instead of structural directives:

```html
<!-- ✅ GOOD: New control flow -->
@if (workouts().length > 0) {
  <div class="jacaona-workout-list">
    @for (workout of workouts(); track workout.id) {
      <app-workout-card [workout]="workout" />
    }
  </div>
} @else {
  <app-empty-state />
}

<!-- ❌ BAD: Old structural directives -->
<div class="jacaona-workout-list" *ngIf="workouts().length > 0">
  <app-workout-card 
    *ngFor="let workout of workouts(); trackBy: trackById" 
    [workout]="workout" 
  />
</div>
<app-empty-state *ngIf="workouts().length === 0" />
```

#### 3. Signal-Based Reactivity
Use signals for reactive state (Angular 16+):

```typescript
// ✅ GOOD: Signals for reactive state
export class HomeComponent {
  workouts = signal<Workout[]>([]);
  isLoading = signal(false);
  totalWorkouts = computed(() => this.workouts().length);
  
  addWorkout(workout: Workout) {
    this.workouts.update(w => [...w, workout]);
  }
}
```

```html
<!-- ✅ GOOD: Signal values in template -->
<div>{{ totalWorkouts() }} workouts</div>
@if (isLoading()) {
  <app-loading-spinner />
}
```

#### 4. Input/Output Naming
Use clear, consistent naming for component APIs:

```typescript
// ✅ GOOD: Clear, descriptive names
@Component({
  selector: 'app-workout-card',
})
export class WorkoutCardComponent {
  // Inputs: noun or adjective
  workout = input.required<Workout>();
  isSelected = input(false);
  menuItems = input.required<MenuItem[]>();
  
  // Outputs: verb (past tense) + noun
  cardClick = output<void>();
  menuAction = output<string>();
  workoutDeleted = output<string>();
}
```

```html
<!-- Usage is self-documenting -->
<app-workout-card
  [workout]="currentWorkout()"
  [isSelected]="selectedId() === workout.id"
  [menuItems]="menuItems"
  (cardClick)="handleCardClick()"
  (menuAction)="handleMenuAction($event)"
  (workoutDeleted)="onWorkoutDeleted($event)"
/>
```

### Component Size Guidelines

**Small Components (Preferred):**
- **Template**: 30-80 lines
- **TypeScript**: 50-150 lines
- **CSS**: 50-120 lines
- Keep inline styles when possible

**Medium Components (Acceptable):**
- **Template**: 80-150 lines
- **TypeScript**: 150-300 lines
- **CSS**: 120-250 lines
- Consider splitting into separate files

**Large Components (Refactor Needed):**
- **Template**: >150 lines → Extract child components
- **TypeScript**: >300 lines → Split into services/composition functions
- **CSS**: >250 lines → Use utility classes or extract to global

### Accessibility (a11y) Requirements

Always include:
- **Semantic HTML**: `<button>`, `<nav>`, `<main>`, `<header>`, etc.
- **ARIA labels**: For icon-only buttons
- **Keyboard navigation**: `tabindex`, focus states
- **Color contrast**: Minimum 4.5:1 for text
- **Focus indicators**: Visible focus rings

```html
<!-- ✅ GOOD: Accessible button -->
<button 
  class="jacaona-icon-btn"
  aria-label="Delete workout"
  (click)="deleteWorkout()"
>
  <svg aria-hidden="true">...</svg>
</button>

<!-- ❌ BAD: Non-accessible -->
<div (click)="deleteWorkout()">
  <svg>...</svg>
</div>
```

### Performance Considerations

**OnPush Change Detection:**
```typescript
// ✅ GOOD: OnPush for better performance
@Component({
  selector: 'app-workout-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

**TrackBy Functions:**
```html
<!-- ✅ GOOD: Track by unique ID -->
@for (workout of workouts(); track workout.id) {
  <app-workout-card [workout]="workout" />
}

<!-- ❌ BAD: Track by index (causes re-renders) -->
@for (workout of workouts(); track $index) {
  <app-workout-card [workout]="workout" />
}
```

**Lazy Loading:**
```typescript
// ✅ GOOD: Lazy load feature modules
{
  path: 'analytics',
  loadComponent: () => import('./components/analytics/analytics').then(m => m.AnalyticsComponent)
}
```

### Code Review Checklist

Before submitting UI code, verify:

- [ ] **Component Naming**: Clear, descriptive, follows conventions
- [ ] **BEM CSS Classes**: Consistent `jacaona-block__element--modifier` pattern
- [ ] **Design Tokens**: Uses CSS variables, no hardcoded values
- [ ] **Semantic HTML**: Appropriate elements (`<button>`, `<nav>`, etc.)
- [ ] **Accessibility**: ARIA labels, keyboard navigation, focus states
- [ ] **Control Flow**: Uses `@if/@for` syntax (not `*ngIf/*ngFor`)
- [ ] **Signals**: Reactive state uses signals (not plain properties)
- [ ] **Component Size**: Reasonable length, extracted where needed
- [ ] **Reusability**: Not over-extracted (single-use components avoided)
- [ ] **Utility Classes**: Common patterns use utilities (not custom CSS)
- [ ] **Performance**: OnPush change detection, track by ID
- [ ] **Responsive**: Mobile-first, tested on different screen sizes
- [ ] **Browser Testing**: Works in Chrome, Firefox, Safari

### Examples of Good Component Structure

**Atom Component (Button):**
```typescript
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [class]="buttonClass()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="handleClick($event)"
    >
      @if (icon()) {
        <svg class="jacaona-btn__icon" [innerHTML]="icon()"></svg>
      }
      <span class="jacaona-btn__text"><ng-content /></span>
    </button>
  `,
  styles: [`
    .jacaona-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--jacaona-space-sm);
      padding: var(--jacaona-space-md) var(--jacaona-space-lg);
      border: none;
      border-radius: var(--jacaona-radius-md);
      font-weight: var(--jacaona-font-weight-semibold);
      cursor: pointer;
      transition: var(--jacaona-transition-fast);
    }
    
    .jacaona-btn--primary {
      background: var(--jacaona-accent-blue);
      color: white;
    }
    
    .jacaona-btn--primary:hover:not(:disabled) {
      background: var(--jacaona-accent-blue-hover);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  disabled = input(false);
  icon = input<string>();
  ariaLabel = input<string>();
  
  clicked = output<MouseEvent>();
  
  buttonClass = computed(() => 
    `jacaona-btn jacaona-btn--${this.variant()}`
  );
  
  handleClick(event: MouseEvent) {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
```

**Organism Component (Workout Card):**
```typescript
@Component({
  selector: 'app-workout-card',
  standalone: true,
  imports: [CardMenuComponent],
  template: `
    <article 
      class="jacaona-workout-card"
      [class.jacaona-workout-card--selected]="isSelected()"
      (click)="cardClick.emit()"
    >
      <div class="jacaona-workout-card__header">
        <div class="jacaona-workout-card__info">
          <h3 class="jacaona-workout-card__title">{{ workout().name }}</h3>
          <time class="jacaona-workout-card__date">{{ formattedDate() }}</time>
        </div>
        
        <app-card-menu
          [menuId]="workout().id"
          [items]="menuItems()"
          (action)="menuAction.emit($event)"
        />
      </div>
      
      <div class="jacaona-workout-card__stats">
        <div class="jacaona-workout-card__stat">
          <span class="jacaona-workout-card__stat-value">{{ duration() }}</span>
          <span class="jacaona-workout-card__stat-label">Duration</span>
        </div>
        <!-- More stats... -->
      </div>
    </article>
  `,
  styleUrl: './workout-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutCardComponent {
  workout = input.required<Workout>();
  formattedDate = input.required<string>();
  duration = input.required<string>();
  menuItems = input.required<MenuItem[]>();
  isSelected = input(false);
  
  cardClick = output<void>();
  menuAction = output<string>();
}
```

### Common Patterns Library

Refer to existing components for proven patterns:
- **Dialogs**: `BottomMenuComponent`, `ThreeButtonDialogComponent`, `ConfirmationDialogComponent`
- **Cards**: `WorkoutCardComponent`, `RoutineCardComponent`, `StatCardComponent`
- **Forms**: `WorkoutTitleInputComponent`, `WorkoutDescriptionComponent`
- **Navigation**: `TopBarComponent`, `BottomNavComponent`
- **Display**: `WorkoutStatsComponent`, `WorkoutWhenComponent`

When creating new components, follow these existing patterns for consistency.

---

## Summary

**Key Principles:**
1. **Atomic Design**: Build from small to large (atoms → molecules → organisms → pages)
2. **BEM Naming**: Consistent, readable CSS class names
3. **Design Tokens**: Always use CSS variables
4. **Component Extraction**: Only when proven duplication (2+ uses)
5. **Semantic HTML**: Accessibility-first approach
6. **Signals**: Modern reactive state management
7. **Performance**: OnPush detection, lazy loading, track by ID

**Remember**: Clean UI code is **readable**, **reusable**, **maintainable**, and **performant**.