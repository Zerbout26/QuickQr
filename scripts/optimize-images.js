import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Image optimization settings
const imageConfigs = {
  'Logo QrCreator sur fond blanc (1).png': {
    width: 256,
    height: 256,
    quality: 80,
    format: 'webp'
  },
  'Design sans titre.png': {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp'
  },
  'ChatGPT Image May 23, 2025, 12_04_53 AM.png': {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp'
  },
  'ChatGPT Image May 23, 2025, 12_08_02 AM.png': {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp'
  },
  'ChatGPT Image May 23, 2025, 12_09_50 AM.png': {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp'
  },
  'image (2).jpg': {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp'
  }
};

async function optimizeImage(filename, config) {
  const inputPath = path.join(publicDir, filename);
  const outputFilename = filename.replace(/\.[^/.]+$/, '.webp');
  const outputPath = path.join(publicDir, outputFilename);

  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${filename} - file not found`);
      return;
    }

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSize = (originalStats.size / 1024).toFixed(2);

    console.log(`🔄 Optimizing ${filename} (${originalSize} KB)...`);

    // Optimize image
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: config.quality })
      .toFile(outputPath);

    // Get optimized file size
    const optimizedStats = fs.statSync(outputPath);
    const optimizedSize = (optimizedStats.size / 1024).toFixed(2);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);

    console.log(`✅ ${outputFilename} created (${optimizedSize} KB) - ${savings}% smaller`);

    // Also create a smaller PNG version for the logo
    if (filename === 'Logo QrCreator sur fond blanc (1).png') {
      const pngOutputPath = path.join(publicDir, 'logo-optimized.png');
      await sharp(inputPath)
        .resize(256, 256, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ quality: 90 })
        .toFile(pngOutputPath);
      
      const pngStats = fs.statSync(pngOutputPath);
      const pngSize = (pngStats.size / 1024).toFixed(2);
      console.log(`✅ logo-optimized.png created (${pngSize} KB)`);
    }

  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error.message);
  }
}

async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');

  for (const [filename, config] of Object.entries(imageConfigs)) {
    await optimizeImage(filename, config);
  }

  console.log('\n🎉 Image optimization complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your HTML to use the optimized images');
  console.log('2. Replace large images with WebP versions');
  console.log('3. Test performance with Lighthouse again');
}

// Run the optimization
optimizeAllImages().catch(console.error); 