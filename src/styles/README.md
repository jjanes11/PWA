# Jacaona CSS Architecture

## 📁 Structure

The CSS is organized into **5 layers** following the CUBE CSS methodology for maintainability and scalability:

```
src/styles/
├── index.css          # Main entry point (imports all layers)
├── tokens.css         # Design tokens (CSS variables)
├── base.css           # Element resets & defaults
├── layout.css         # Layout patterns & containers
├── components.css     # Reusable UI components
└── utilities.css      # Single-purpose utility classes
```

## 🎯 Layer Purpose

### 1. **tokens.css** - Design System Foundation
Central source of truth for all design values. Only CSS variables, no selectors.

**Contents:**
- Color palette (backgrounds, text, accents, semantic)
- Typography (fonts, weights, sizes, line heights)
- Spacing scale (xs to 4xl)
- Border radius
- Shadows
- Transitions
- Z-index scale

**Example:**
```css
:root {
  --jacaona-accent-blue: #3b82f6;
  --jacaona-space-lg: 16px;
  --jacaona-radius-md: 8px;
}
```

### 2. **base.css** - Element Defaults
CSS resets and base element styles. Uses element selectors only (no classes).

**Contents:**
- CSS reset (`*, *::before, *::after`)
- HTML/body defaults
- Typography elements (h1-h6, p, a)
- Form elements (button, input, textarea)
- Images & media
- Custom scrollbars

**Example:**
```css
body {
  font-family: var(--jacaona-font-primary);
  background: var(--jacaona-bg-primary);
}
```

### 3. **layout.css** - Page Structure
Reusable layout patterns for page structure and spacing.

**Contents:**
- Containers (`.jacaona-container`)
- Grid systems (`.jacaona-grid-2`, `.jacaona-grid-3`)
- Section patterns (`.jacaona-section`, `.jacaona-section-header`)
- Dividers (`.jacaona-divider`)
- Responsive layouts

**Example:**
```css
.jacaona-container {
  flex: 1;
  padding: var(--jacaona-space-lg);
}

.jacaona-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--jacaona-space-lg);
}
```

### 4. **components.css** - UI Components
Reusable component patterns following BEM naming.

**Contents:**
- Buttons (`.jacaona-btn`, `.jacaona-btn--primary`)
- Cards (`.jacaona-card`, `.jacaona-card--clickable`)
- Form inputs (`.jacaona-input`, `.jacaona-textarea`)
- Stats (`.jacaona-stat`, `.jacaona-stat-card`)
- Loading & empty states

**BEM Naming:**
```css
.component              /* Block */
.component__element     /* Element */
.component--modifier    /* Modifier */
```

**Example:**
```css
.jacaona-btn { /* base styles */ }
.jacaona-btn--primary { background: var(--jacaona-accent-blue); }
.jacaona-btn--secondary { background: var(--jacaona-bg-tertiary); }
```

### 5. **utilities.css** - Atomic Classes
Single-purpose utility classes for rapid composition.

**Contents:**
- Typography (`.jacaona-text-lg`, `.jacaona-font-bold`)
- Flexbox (`.jacaona-flex`, `.jacaona-items-center`)
- Spacing (`.jacaona-mb-lg`, `.jacaona-p-md`)
- Sizing (`.jacaona-w-full`, `.jacaona-h-full`)
- Display (`.jacaona-hidden`, `.jacaona-block`)
- Colors (`.jacaona-text-primary`, `.jacaona-text-muted`)

**Example:**
```css
.jacaona-mb-lg { margin-bottom: var(--jacaona-space-lg); }
.jacaona-flex { display: flex; }
.jacaona-items-center { align-items: center; }
```

## 🎨 Usage Guidelines

### When to Use Each Layer

| Need | Use | Example |
|------|-----|---------|
| Change a design value | `tokens.css` | Update `--jacaona-accent-blue` |
| Style HTML elements | `base.css` | Set default `<button>` styles |
| Create page layout | `layout.css` | Use `.jacaona-container` |
| Build reusable component | `components.css` | Create `.jacaona-modal` |
| Quick styling in HTML | `utilities.css` | Add `jacaona-mb-lg jacaona-flex` |
| Component-specific style | Component CSS file | `.workout-specific-thing` |

### Naming Convention

All global classes use the `jacaona-` prefix to avoid conflicts:
- ✅ `.jacaona-btn`
- ✅ `.jacaona-container`
- ✅ `.jacaona-flex`
- ❌ `.btn` (too generic, could conflict)

### Component-Specific CSS

Component files should now be **much smaller** and only contain:
- Styles unique to that component
- Overrides of global components
- Component-specific state variations

**Before:**
```css
/* edit-workout.css - 140 lines */
.workout-container { flex: 1; padding: 16px; }
.workout-input { width: 100%; padding: 12px; ... }
.workout-stat { text-align: center; }
/* ... many more duplicated patterns */
```

**After:**
```css
/* edit-workout.css - 20 lines */
/* Only unique workout-specific styles */
.workout-datetime-display {
  /* Something truly unique to this component */
}
```

Use global classes in HTML instead:
```html
<div class="jacaona-container">
  <input class="jacaona-input jacaona-input--lg">
  <div class="jacaona-stat">...</div>
</div>
```

## 🚀 Benefits

### 1. **Single Source of Truth**
- All design tokens in one place
- Update `--jacaona-space-lg` once, affects entire app

### 2. **Reduced Duplication**
- Common patterns defined once
- Component CSS files now 50-80% smaller

### 3. **Faster Development**
- Compose utilities in HTML: `jacaona-flex jacaona-items-center jacaona-gap-lg`
- No need to write CSS for common patterns

### 4. **Better Maintainability**
- Clear organization by purpose
- Easy to find where styles live
- Predictable specificity (utilities win)

### 5. **Smaller Bundle Sizes**
- Shared styles loaded once globally
- Component CSS only contains unique styles

## 📚 Quick Reference

### Common Utilities

```html
<!-- Layout -->
<div class="jacaona-container">
<div class="jacaona-grid-3">
<div class="jacaona-flex jacaona-items-center jacaona-gap-md">

<!-- Spacing -->
<div class="jacaona-mb-lg jacaona-p-md">

<!-- Typography -->
<h2 class="jacaona-text-xl jacaona-font-bold jacaona-text-primary">

<!-- Components -->
<button class="jacaona-btn jacaona-btn--primary">
<div class="jacaona-card jacaona-card--clickable">
<input class="jacaona-input jacaona-input--lg">
```

### Spacing Scale
- `xs` = 4px
- `sm` = 8px
- `md` = 12px
- `lg` = 16px
- `xl` = 20px
- `2xl` = 24px
- `3xl` = 32px
- `4xl` = 40px

### Responsive Utilities
```html
<!-- Hide on mobile -->
<div class="jacaona-hide-mobile">Desktop only</div>

<!-- Show on mobile -->
<div class="jacaona-show-mobile">Mobile only</div>

<!-- Stack on mobile -->
<div class="jacaona-flex jacaona-stack-mobile">
```

## 🔧 Maintenance

### Adding New Design Tokens
1. Add to `tokens.css`
2. Use token in other CSS files via `var(--token-name)`

### Creating New Components
1. Add reusable pattern to `components.css` with BEM naming
2. Use in HTML with class names
3. Only add to component CSS if truly unique

### Adding Utilities
1. Add to `utilities.css` following naming convention
2. Single responsibility (one property per class)
3. Use token values, not hardcoded

## 📊 Migration Status

### Phase 1: ✅ Complete
- Created CSS architecture
- Split styles.css into layers
- Updated angular.json
- **Result:** Build successful, all styles working

### Phase 2: Next Steps
- Extract common patterns from component CSS files
- Replace duplicated styles with utility classes
- Reduce component CSS bundle sizes
- Eliminate CSS budget warnings

## 🎯 Goals

- ⬜ Reduce component CSS from ~800 lines to ~500 lines (-37%)
- ⬜ Eliminate 4 CSS budget warnings
- ⬜ Reduce duplication from 50% to <10%
- ⬜ Component CSS files: 50-140 lines → 10-30 lines each

---

**Need help?** Check examples in existing component CSS files or reference this guide.
