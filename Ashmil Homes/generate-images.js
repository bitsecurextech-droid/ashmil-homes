const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const images = {
  'logo-ashmil-DAwsa8ai.jpg': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#0A1A2F"/><circle cx="100" cy="100" r="80" fill="#D4AF37"/><text x="100" y="110" font-size="24" text-anchor="middle" fill="#0A1A2F" font-family="Arial">AH</text></svg>`,
  'hero-1-CMEeD1Us.jpg': `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1920" height="1080" fill="#0A1A2F"/><text x="960" y="540" font-size="64" text-anchor="middle" fill="#D4AF37" font-family="serif">Your Dream Home</text></svg>`,
  'hero-2-CO4prCJp.jpg': `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1920" height="1080" fill="#051020"/><text x="960" y="540" font-size="64" text-anchor="middle" fill="#D4AF37" font-family="serif">Crafted with Precision</text></svg>`,
  'hero-3-Q8mqRVOz.jpg': `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1920" height="1080" fill="#0A1A2F"/><text x="960" y="540" font-size="64" text-anchor="middle" fill="#D4AF37" font-family="serif">Own a Piece of Lagos</text></svg>`,
  'placeholder.jpg': `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#1E2A3A"/><text x="400" y="320" font-size="32" text-anchor="middle" fill="#D4AF37" font-family="sans-serif">Property Image</text></svg>`
};

for (const [filename, svgContent] of Object.entries(images)) {
  fs.writeFileSync(path.join(assetsDir, filename), svgContent);
  console.log(`Created: ${filename}`);
}
console.log('✅ All placeholder images generated inside public/assets/');