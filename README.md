# Angular PWA - Progressive Web App

A simple Angular Progressive Web App (PWA) that demonstrates modern web app capabilities including offline functionality, installability, and responsive design. This project is automatically deployed to GitHub Pages using GitHub Actions.

## 🚀 Live Demo

Once deployed, your PWA will be available at: `https://yourusername.github.io/jacaona/`

## ✨ PWA Features

- 📱 **Installable**: Can be installed on devices like a native app
- 🔌 **Offline Support**: Works offline with service worker caching
- 📲 **Responsive Design**: Optimized for all screen sizes
- ⚡ **Fast Loading**: Optimized builds with lazy loading
- 🔄 **Auto Updates**: Service worker handles app updates automatically

## 🛠️ Setup & Development

### Prerequisites

- Node.js 20.19.0 or compatible version
- npm or yarn package manager
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jacaona.git
   cd jacaona
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/` in your browser.

4. **Build for production**
   ```bash
   npm run build
   ```
   Build artifacts will be stored in the `dist/jacaona-app/browser/` directory.

## 📦 Deployment

### Automatic Deployment (GitHub Actions)

This project includes a GitHub Actions workflow that automatically:

1. **Builds** the Angular app when you push to the `main` branch
2. **Deploys** to GitHub Pages
3. **Serves** your PWA at `https://yourusername.github.io/jacaona/`

### Setup GitHub Pages Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/jacaona.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (will be created automatically by Actions)
   - Folder: `/ (root)`

3. **Enable GitHub Actions**
   - Go to your repository Settings > Actions > General
   - Allow all actions and reusable workflows

### Manual Deployment

You can also deploy to other platforms:

```bash
# Build for production
npm run build

# Deploy the dist/jacaona-app/browser/ folder to your hosting provider
```

## 🏗️ Project Structure

```
src/
├── app/                 # Angular components and services
├── assets/              # Static assets
├── styles.css           # Global styles
├── main.ts             # Application bootstrap
└── index.html          # Main HTML file

public/
├── icons/              # PWA icons (various sizes)
├── manifest.webmanifest # PWA manifest file
└── favicon.ico         # Browser favicon

.github/
└── workflows/
    └── deploy.yml      # GitHub Actions deployment workflow
```

## 🔧 PWA Configuration

### Service Worker
- **File**: `ngsw-config.json`
- **Features**: Automatic caching, update notifications, offline support
- **Cache Strategy**: Cache first for static assets, network first for API calls

### Web App Manifest
- **File**: `public/manifest.webmanifest`
- **Features**: App installation, theme colors, display modes, icons

### Icons
- Multiple sizes included: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Location**: `public/icons/`

## 📱 Testing PWA Features

### Install as App
1. Open the deployed PWA in Chrome/Edge
2. Look for the install button in the address bar
3. Click install to add to your device

### Test Offline
1. Open DevTools > Application > Service Workers
2. Check "Offline" checkbox
3. Refresh the page - it should still work!

### Lighthouse Audit
1. Open DevTools > Lighthouse
2. Run PWA audit
3. Should score high on PWA criteria

## 🔄 Updates & Maintenance

### Adding New Features
1. Develop new components/features
2. Test locally with `npm start`
3. Commit and push to trigger automatic deployment

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Angular Updates
```bash
ng update @angular/core @angular/cli
ng update @angular/pwa
```

## 🎯 Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run watch` | Build with file watching |
| `ng generate component name` | Generate new component |
| `ng add @angular/material` | Add Angular Material |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8
