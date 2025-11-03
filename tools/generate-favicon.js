const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawBarbellIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const scale = size / 512;
    
    // Dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, size, size);
    
    // Save context and rotate 45 degrees around center
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(45 * Math.PI / 180);
    ctx.translate(-size / 2, -size / 2);
    
    // Draw barbell in single blue color
    ctx.fillStyle = '#3b82f6';
    
    // Center bar - even thicker and shorter
    const barHeight = 38 * scale;
    const barY = (size - barHeight) / 2;
    const barWidth = size * 0.35;
    const barX = (size - barWidth) / 2;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Weight plates - all same blue color
    function drawPlate(x, width, height) {
        const plateY = (size - height) / 2;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, plateY, width, height);
    }
    
    // Left weight plates
    const plate1Width = 40 * scale;
    const plate1Height = 160 * scale;
    drawPlate(barX - plate1Width, plate1Width, plate1Height);
    
    const plate2Width = 32 * scale;
    const plate2Height = 130 * scale;
    drawPlate(barX - plate1Width - plate2Width - 3 * scale, plate2Width, plate2Height);
    
    // Right weight plates
    drawPlate(barX + barWidth, plate1Width, plate1Height);
    drawPlate(barX + barWidth + plate1Width + 3 * scale, plate2Width, plate2Height);
    
    // Restore context
    ctx.restore();
}

// Generate 32x32 favicon
const size = 32;
const canvas = createCanvas(size, size);
drawBarbellIcon(canvas, size);

const buffer = canvas.toBuffer('image/png');
const filepath = path.join(__dirname, '..', 'public', 'favicon.png');

fs.writeFileSync(filepath, buffer);
console.log('✓ Generated favicon.png (32x32)');

// Also generate 16x16 version
const size16 = 16;
const canvas16 = createCanvas(size16, size16);
drawBarbellIcon(canvas16, size16);

const buffer16 = canvas16.toBuffer('image/png');
const filepath16 = path.join(__dirname, '..', 'public', 'favicon-16.png');

fs.writeFileSync(filepath16, buffer16);
console.log('✓ Generated favicon-16.png (16x16)');

console.log('\n🎉 Favicon generated successfully!');
