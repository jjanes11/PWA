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