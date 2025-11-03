const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawBarbellIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const scale = size / 512; // Base design on 512x512
    
    // Dark background (matching Jacaona theme)
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
    const barHeight = 38 * scale; // Increased from 28
    const barY = (size - barHeight) / 2;
    const barWidth = size * 0.35; // Reduced from 0.45
    const barX = (size - barWidth) / 2;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Weight plates - all same blue color
    function drawPlate(x, width, height) {
        const plateY = (size - height) / 2;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, plateY, width, height);
    }
    
    // Left weight plates - larger/thicker
    const plate1Width = 40 * scale; // Increased from 35
    const plate1Height = 160 * scale; // Increased from 140
    drawPlate(barX - plate1Width, plate1Width, plate1Height);
    
    const plate2Width = 32 * scale; // Increased from 28
    const plate2Height = 130 * scale; // Increased from 110
    drawPlate(barX - plate1Width - plate2Width - 3 * scale, plate2Width, plate2Height);
    
    // Right weight plates
    drawPlate(barX + barWidth, plate1Width, plate1Height);
    drawPlate(barX + barWidth + plate1Width + 3 * scale, plate2Width, plate2Height);
    
    // Restore context
    ctx.restore();
}

// Generate icons for all sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    drawBarbellIcon(canvas, size);
    
    const buffer = canvas.toBuffer('image/png');
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated ${filename}`);
});

console.log('\n🎉 All icons generated successfully!');
console.log(`📁 Location: ${iconsDir}`);
