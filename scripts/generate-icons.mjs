// Generate simple PNG icons using pure Node.js (requires no dependencies)
// Uses a minimal PNG encoder

import { writeFileSync, mkdirSync } from "fs";

const SIZES = [192, 512];

function createPNG(size) {
  // Create a simple emerald/green icon with "OB" text
  // Using a minimal valid PNG approach via canvas-like pixel data
  
  const canvas = Buffer.alloc(size * size * 4);
  const emerald = { r: 5, b: 150, g: 105, a: 255 }; // #059669
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Rounded circle background
      const cx = size / 2, cy = size / 2;
      const r = size / 2 - size * 0.08;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= r) {
        // Book icon design
        canvas[i] = emerald.r;
        canvas[i + 1] = emerald.g;
        canvas[i + 2] = emerald.b;
        canvas[i + 3] = emerald.a;
        
        // Draw a simple book shape
        const bookWidth = size * 0.5;
        const bookHeight = size * 0.35;
        const bx1 = (size - bookWidth) / 2;
        const by1 = (size - bookHeight) / 2;
        const bx2 = bx1 + bookWidth;
        const by2 = by1 + bookHeight;
        
        // Book pages (white overlay)
        if (x >= bx1 + size*0.08 && x <= bx2 - size*0.08 && 
            y >= by1 + size*0.06 && y <= by2 - size*0.06) {
          // Left page
          if (x < (bx1 + bx2) / 2 - size * 0.02) {
            canvas[i] = 255;
            canvas[i+1] = 255;
            canvas[i+2] = 255;
          }
          // Right page  
          else if (x > (bx1 + bx2) / 2 + size * 0.02) {
            canvas[i] = 255;
            canvas[i+1] = 255;
            canvas[i+2] = 255;
          }
          // Spine
        }
        
        // Two horizontal lines to suggest pages
        const lineY1 = size * 0.44;
        const lineY2 = size * 0.56;
        if (y >= lineY1 - 1 && y <= lineY1 + 1 && x >= bx1 + size*0.1 && x <= bx2 - size*0.1) {
          canvas[i] = 200; canvas[i+1] = 250; canvas[i+2] = 245; canvas[i+3] = 200;
        }
        if (y >= lineY2 - 1 && y <= lineY2 + 1 && x >= bx1 + size*0.1 && x <= bx2 - size*0.1) {
          canvas[i] = 200; canvas[i+1] = 250; canvas[i+2] = 245; canvas[i+3] = 200;
        }
      } else {
        // Transparent outside
        canvas[i] = 0;
        canvas[i + 1] = 0;
        canvas[i + 2] = 0;
        canvas[i + 3] = 0;
      }
    }
  }
  
  return canvas;
}

// Actually, let me use a simpler approach — generate SVG icons as data URIs embedded in HTML,
// and create proper PNGs using a basic approach

// For now, create simple SVG files that work as PWA icons
function createSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#059669"/>
  <rect x="${size * 0.2}" y="${size * 0.25}" width="${size * 0.6}" height="${size * 0.5}" rx="${size * 0.03}" fill="white" opacity="0.95"/>
  <rect x="${size * 0.25}" y="${size * 0.3}" width="${size * 0.23}" height="${size * 0.4}" rx="${size * 0.02}" fill="#059669" opacity="0.15"/>
  <rect x="${size * 0.52}" y="${size * 0.3}" width="${size * 0.23}" height="${size * 0.4}" rx="${size * 0.02}" fill="#059669" opacity="0.08"/>
  <line x1="${size * 0.27}" y1="${size * 0.42}" x2="${size * 0.73}" y2="${size * 0.42}" stroke="#059669" stroke-opacity="0.3" stroke-width="${size * 0.015}"/>
  <line x1="${size * 0.27}" y1="${size * 0.52}" x2="${size * 0.73}" y2="${size * 0.52}" stroke="#059669" stroke-opacity="0.3" stroke-width="${size * 0.015}"/>
  <line x1="${size * 0.27}" y1="${size * 0.62}" x2="${size * 0.6}" y2="${size * 0.62}" stroke="#059669" stroke-opacity="0.2" stroke-width="${size * 0.015}"/>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

for (const size of SIZES) {
  const svg = createSVGIcon(size);
  writeFileSync(`public/icons/icon-${size}.svg`, svg);
  console.log(`Created icon-${size}.svg`);
}

console.log("\nNote: For production PWA, convert SVGs to PNGs using a tool like sharp or an online converter.");
console.log("SVGs work as PWA icons in most modern browsers.");
