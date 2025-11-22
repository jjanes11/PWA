/**
 * PurgeCSS Configuration for CSS Auditing
 * 
 * This analyzes built files to find unused CSS classes.
 * Run: npm run css:audit
 * 
 * Note: Some classes may be flagged as unused if they're:
 * - Dynamically generated in TypeScript
 * - Used in inline template strings
 * - Applied conditionally via Angular bindings
 */

module.exports = {
  // Source files to scan for CSS class usage
  content: [
    './dist/jacaona-app/browser/**/*.js',
    './dist/jacaona-app/browser/**/*.html',
  ],
  
  // CSS files to analyze
  css: ['./dist/jacaona-app/browser/**/*.css'],
  
  // Output directory for report
  output: './.purgecss-report/',
  
  // Safelist - classes to never remove (even if not found)
  safelist: {
    standard: [
      // Angular dynamic classes
      /^ng-/,
      /^cdk-/,
      
      // Jacaona base classes that might be added dynamically
      'jacaona-btn',
      'jacaona-card',
      'jacaona-badge',
      
      // State classes potentially added via JavaScript
      /--active$/,
      /--selected$/,
      /--disabled$/,
      /--error$/,
    ],
    deep: [],
    greedy: []
  },
  
  // Variables to preserve
  variables: true,
  
  // Keyframes to preserve
  keyframes: true,
  
  // Font-face rules to preserve
  fontFace: true,
};
