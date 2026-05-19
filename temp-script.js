const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');

async function run() {
  const src = 'public/logo.png';
  const resizeOptions = {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  };
  
  try {
    console.log('Generating apple-icon.png (180x180)...');
    await sharp(src).resize(180, 180, resizeOptions).toFile('public/apple-icon.png');
    
    console.log('Generating icon-192.png (192x192)...');
    await sharp(src).resize(192, 192, resizeOptions).toFile('public/icon-192.png');
    
    console.log('Generating icon-512.png (512x512)...');
    await sharp(src).resize(512, 512, resizeOptions).toFile('public/icon-512.png');
    
    console.log('Generating og-image.png (1200x630)...');
    await sharp(src).resize(1200, 630, resizeOptions).toFile('public/og-image.png');
    
    console.log('Generating temp favicon (32x32)...');
    await sharp(src).resize(32, 32, resizeOptions).toFile('public/temp-favicon.png');
    
    console.log('Converting to favicon.ico...');
    const buf = await pngToIco('public/temp-favicon.png');
    fs.writeFileSync('public/favicon.ico', buf);
    fs.unlinkSync('public/temp-favicon.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

run();
