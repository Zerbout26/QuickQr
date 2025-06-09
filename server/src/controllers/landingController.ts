import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { getOptimizedUrl } from '../config/cloudinary';
import { In } from 'typeorm';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Optimized cache with size limits and LRU-like behavior
const MAX_CACHE_SIZE = 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const qrCodeCache = new Map<string, { data: QRCode, timestamp: number }>();

// Batch update queue for scan stats
const scanStatsQueue = new Map<string, { count: number, history: any[] }>();
const BATCH_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

// Process batch updates
async function processBatchUpdates() {
  if (scanStatsQueue.size === 0) return;

  try {
    const updates = Array.from(scanStatsQueue.entries()).map(([id, stats]) => ({
      id,
      scanCount: stats.count,
      scanHistory: stats.history
    }));

    // Batch update using TypeORM with optimized query
    await qrCodeRepository
      .createQueryBuilder()
      .update(QRCode)
      .set({
        scanCount: () => `scan_count + 1`,
        scanHistory: () => `array_append(scan_history, :history)`
      })
      .whereInIds(updates.map(u => u.id))
      .setParameter('history', JSON.stringify(updates[0].scanHistory))
      .execute();

    // Clear the queue
    scanStatsQueue.clear();
  } catch (error) {
    console.error('Error processing batch updates:', error);
  }
}

// Start batch update interval
setInterval(processBatchUpdates, BATCH_UPDATE_INTERVAL);

// Enhanced cache cleanup function with memory optimization
function cleanupCache() {
  const now = Date.now();
  const entries = Array.from(qrCodeCache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      qrCodeCache.delete(key);
    }
  });

  // If still over size limit, remove oldest entries
  if (qrCodeCache.size > MAX_CACHE_SIZE) {
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entries.length - MAX_CACHE_SIZE)
      .forEach(([key]) => qrCodeCache.delete(key));
  }
}

// Run cleanup more frequently for better memory management
setInterval(cleanupCache, 30 * 1000); // Every 30 seconds

// Optimized Cloudinary URL generation with caching
const cloudinaryUrlCache = new Map<string, string>();
const CLOUDINARY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getOptimizedCloudinaryUrl(url: string): string {
  if (!url.includes('cloudinary.com')) return url;
  
  const cloudinaryUrl = new URL(url);
  cloudinaryUrl.searchParams.set('q_auto', 'good');
  cloudinaryUrl.searchParams.set('f_auto', 'webp');
  cloudinaryUrl.searchParams.set('w_auto', '300');
  cloudinaryUrl.searchParams.set('c_scale', 'auto');
  
  return cloudinaryUrl.toString();
}

// Preload critical assets with preconnect
const preloadAssets = (logoUrl: string) => `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" as="style">
  <link rel="preload" href="${logoUrl}" as="image" fetchpriority="high">
`;

// Optimized critical CSS with only essential styles
const criticalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }
  .container { max-width: 100%; padding: 1rem; margin: 0 auto; }
  .logo { max-width: 150px; height: auto; margin-bottom: 1rem; }
  .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
  .buttons { display: flex; flex-direction: column; gap: 0.5rem; }
  .button { display: inline-block; padding: 0.75rem 1rem; text-decoration: none; border-radius: 0.5rem; }
  .menu-section { margin-top: 1rem; }
  .menu-header { font-size: 1.25rem; margin-bottom: 0.5rem; }
  .menu-categories { display: flex; flex-direction: column; gap: 1rem; }
  .category { background: #f9fafb; border-radius: 0.5rem; overflow: hidden; }
  .category-name { padding: 0.5rem; font-weight: 600; }
  .category-items { padding: 0.5rem; }
  .item { background: white; padding: 0.5rem; border-radius: 0.25rem; }
  @media (min-width: 480px) { .category-items { grid-template-columns: repeat(2, 1fr); } }
`;

// Optimized HTML template with minimal DOM
const generateHTML = (qrCode: QRCode, logoUrl: string, customCSS: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${qrCode.name} - QR Code Landing Page">
    <title>${qrCode.name}</title>
    ${logoUrl ? `<link rel="preload" href="${logoUrl}" as="image">` : ''}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
    <style>
      ${criticalCSS}
      ${customCSS}
    </style>
  </head>
  <body>
    <div class="container">
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" loading="eager" fetchpriority="high" width="150" height="80">` : ''}
      <h1 class="title">${qrCode.name}</h1>
      ${qrCode.links?.length ? `
        <div class="buttons">
          ${qrCode.links.map(link => `
            <a href="${link.url}" class="button" target="_blank" rel="noopener">
              ${link.label}
            </a>
          `).join('')}
        </div>
      ` : ''}
      ${qrCode.menu ? `
        <div class="menu-section">
          <h2 class="menu-header">Menu</h2>
          <div class="menu-categories">
            ${qrCode.menu.categories.map(category => `
              <div class="category">
                <div class="category-name">${category.name}</div>
                <div class="category-items">
                  ${category.items.map(item => `
                    <div class="item">
                      <h3>${item.name}</h3>
                      <p>${item.description}</p>
                      <p><strong>${item.price}</strong></p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  </body>
</html>
`;

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cachedQRCode = qrCodeCache.get(id);
    if (cachedQRCode && Date.now() - cachedQRCode.timestamp < CACHE_DURATION) {
      // Update timestamp to keep cache fresh
      cachedQRCode.timestamp = Date.now();
      
      // Queue scan stats update
      const currentStats = scanStatsQueue.get(id) || { count: 0, history: [] };
      scanStatsQueue.set(id, {
        count: currentStats.count + 1,
        history: [...currentStats.history, {
          timestamp: new Date(),
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: req.ip || 'Unknown'
        }]
      });

      // Set optimized cache headers
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('ETag', `"${cachedQRCode.data.id}-${cachedQRCode.data.updatedAt.getTime()}"`);
      res.setHeader('Vary', 'Accept-Encoding');

      return serveLandingPage(res, cachedQRCode.data, req);
    }

    // Optimized database query with specific fields and relations
    const qrCode = await qrCodeRepository
      .createQueryBuilder('qr')
      .select([
        'qr.id',
        'qr.name',
        'qr.logoUrl',
        'qr.foregroundColor',
        'qr.backgroundColor',
        'qr.links',
        'qr.menu',
        'qr.type',
        'qr.originalUrl',
        'qr.updatedAt'
      ])
      .leftJoinAndSelect('qr.user', 'user', 'user.isActive = :isActive', { isActive: true })
      .where('qr.id = :id', { id })
      .cache(true) // Enable query caching
      .getOne();

    if (!qrCode) {
      const notFoundQRCode: Partial<QRCode> = {
        name: 'QR Code Not Found',
        links: [],
        menu: {
          restaurantName: '',
          categories: []
        }
      };
      return res.status(404).send(generateHTML(notFoundQRCode as QRCode, '', criticalCSS));
    }

    // Check if user is active
    if (!qrCode.user?.isActive) {
      const frontendDomain = process.env.FRONTEND_URL || 'http://localhost:8080';
      return res.redirect(`${frontendDomain}/payment-instructions`);
    }

    // Queue scan stats update
    const currentStats = scanStatsQueue.get(id) || { count: 0, history: [] };
    scanStatsQueue.set(id, {
      count: currentStats.count + 1,
      history: [...currentStats.history, {
        timestamp: new Date(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      }]
    });

    // Cache the QR code
    qrCodeCache.set(id, { data: qrCode, timestamp: Date.now() });

    // Clean up cache if it gets too large
    if (qrCodeCache.size > MAX_CACHE_SIZE) {
      const oldestKey = Array.from(qrCodeCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      qrCodeCache.delete(oldestKey);
    }

    // Set optimized cache headers
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.setHeader('ETag', `"${qrCode.id}-${qrCode.updatedAt.getTime()}"`);
    res.setHeader('Vary', 'Accept-Encoding');

    // Serve the landing page
    return serveLandingPage(res, qrCode, req);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).send('Internal Server Error');
  }
};

function serveLandingPage(res: Response, qrCode: QRCode, req: Request) {
  // Get optimized logo URL with caching
  const logoUrl = qrCode.logoUrl ? getOptimizedCloudinaryUrl(qrCode.logoUrl) : '';

  // Generate custom CSS with dynamic colors
  const customCSS = `
    :root {
      --primary-color: ${qrCode.foregroundColor || '#4A90E2'};
      --secondary-color: ${qrCode.backgroundColor || '#F4D03F'};
      --background-color: ${qrCode.backgroundColor || '#FAFAFA'};
      --text-color: ${qrCode.foregroundColor || '#2C3E50'};
    }
    
    .logo {
      max-width: 150px;
      max-height: 80px;
      height: auto;
      margin-bottom: 1.5rem;
      object-fit: contain;
    }
    
    .title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }
    
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    
    .button {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.3s;
      text-align: center;
    }
    
    .button:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    
    .menu-section {
      margin-top: 2rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
      width: 100%;
    }
    
    .menu-header {
      color: var(--primary-color);
      font-size: 1.25rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    .menu-categories {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .category {
      background: #f9fafb;
      border-radius: 0.5rem;
      overflow: hidden;
      border-left: 3px solid var(--primary-color);
      transition: all 0.3s;
    }
    
    .category:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    
    .category-name {
      background-color: var(--primary-color);
      color: white;
      padding: 0.75rem;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .category-items {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      padding: 0.75rem;
    }
    
    @media (min-width: 480px) {
      .category-items {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    .item {
      background: white;
      padding: 0.75rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.3s;
      border: 1px solid var(--border-color);
    }
    
    .item:hover {
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
  `;

  // Generate and send optimized HTML
  res.send(generateHTML(qrCode, logoUrl, customCSS));
}

function darkenColor(hex: string, amount: number): string {
  // Remove the hash if it exists
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each component
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
