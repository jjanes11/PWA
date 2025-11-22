/**
 * CSS Usage Analyzer
 * 
 * Scans built files for CSS class usage and generates a report.
 * More accurate than PurgeCSS for Angular apps with dynamic classes.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist/jacaona-app/browser');
const STYLES_DIR = path.join(__dirname, '../src/styles');

// Extract all CSS classes from style files
function extractCssClasses(dir) {
  const classes = new Set();
  const cssClassRegex = /\.jacaona-[\w-]+/g;
  
  function scanDir(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(cssClassRegex);
        if (matches) {
          matches.forEach(match => classes.add(match.substring(1))); // Remove leading dot
        }
      }
    });
  }
  
  scanDir(dir);
  return classes;
}

// Find class usage in built files
function findClassUsage(dir, classesToFind) {
  const usage = new Map();
  classesToFind.forEach(cls => usage.set(cls, []));
  
  function scanDir(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        classesToFind.forEach(cls => {
          if (content.includes(cls)) {
            usage.get(cls).push(path.relative(DIST_DIR, filePath));
          }
        });
      }
    });
  }
  
  scanDir(dir);
  return usage;
}

// Main analysis
console.log('🔍 Analyzing CSS usage...\n');

const cssClasses = extractCssClasses(STYLES_DIR);
console.log(`📊 Found ${cssClasses.size} CSS classes defined\n`);

const usage = findClassUsage(DIST_DIR, cssClasses);

const unused = [];
const used = [];

usage.forEach((files, className) => {
  if (files.length === 0) {
    unused.push(className);
  } else {
    used.push({ className, files });
  }
});

console.log(`✅ Used classes: ${used.length}`);
console.log(`❌ Potentially unused classes: ${unused.length}\n`);

if (unused.length > 0) {
  console.log('⚠️  Potentially Unused Classes:');
  console.log('(Note: May include dynamically added classes)\n');
  unused.sort().forEach(cls => {
    console.log(`  - .${cls}`);
  });
  console.log('');
}

// Generate detailed report
const reportPath = path.join(__dirname, '../.css-usage-report.json');
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalClasses: cssClasses.size,
    usedClasses: used.length,
    unusedClasses: unused.length,
  },
  unused: unused,
  used: used.map(u => ({
    className: u.className,
    fileCount: u.files.length,
    files: u.files,
  })),
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Detailed report saved to: .css-usage-report.json\n`);

// Exit with error if unused classes found (optional for CI)
// process.exit(unused.length > 0 ? 1 : 0);
