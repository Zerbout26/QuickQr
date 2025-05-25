import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { getOptimizedUrl } from '../config/cloudinary';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Cache for QR codes
const qrCodeCache = new Map<string, { data: QRCode, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload critical assets
const preloadAssets = (logoUrl: string) => `
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" as="style">
  <link rel="preload" href="${logoUrl}" as="image">
`;

// Inline critical CSS
const criticalCSS = `
  :root {
    --primary-color: #4A90E2;
    --secondary-color: #F4D03F;
    --accent-color: #00BCD4;
    --background-color: #FAFAFA;
    --text-color: #2C3E50;
    --text-light: #6b7280;
    --border-color: #e5e7eb;
    --border-radius: 0.75rem;
  }
  
  body {
    font-family: 'Cairo', system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
  }
  
  .container {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
    background: white;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    margin: 1rem;
    border-left: 4px solid var(--primary-color);
  }
`;

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cachedQRCode = qrCodeCache.get(id);
    if (cachedQRCode && Date.now() - cachedQRCode.timestamp < CACHE_DURATION) {
      return serveLandingPage(res, cachedQRCode.data, req);
    }

    // If not in cache, fetch from database
    const qrCode = await qrCodeRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${criticalCSS}</style>
          </head>
          <body>
            <div class="container">
              <h1>QR Code Not Found</h1>
              <p>The requested QR code does not exist or has been removed.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Check if user is active
    if (!qrCode.user.isActive) {
      const frontendDomain = process.env.FRONTEND_URL || 'http://localhost:8080';
      return res.redirect(`${frontendDomain}/payment-instructions`);
    }

    // Update scan count and history
    await updateScanStats(qrCode, req);

    // Cache the QR code
    qrCodeCache.set(id, { data: qrCode, timestamp: Date.now() });

    // Serve the landing page
    return serveLandingPage(res, qrCode, req);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).send('Internal Server Error');
  }
};

async function updateScanStats(qrCode: QRCode, req: Request) {
  // Initialize scan count and history if they don't exist
  if (typeof qrCode.scanCount !== 'number') {
    qrCode.scanCount = 0;
  }
  if (!Array.isArray(qrCode.scanHistory)) {
    qrCode.scanHistory = [];
  }

  // Increment scan count and log scan history
  qrCode.scanCount += 1;
  qrCode.scanHistory.push({
    timestamp: new Date(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || 'Unknown'
  });
  
  // Save the updated QR code
  await qrCodeRepository.save(qrCode);
}

function serveLandingPage(res: Response, qrCode: QRCode, req: Request) {
  // Get optimized logo URL if it exists
  const logoUrl = qrCode.logoUrl ? getOptimizedUrl(qrCode.logoUrl, {
    width: 150,
    height: 80,
    crop: 'fill',
    quality: 'auto'
  }) : '';

  // Set cache headers
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.setHeader('ETag', `"${qrCode.id}-${qrCode.updatedAt.getTime()}"`);

  // Generate HTML with optimized structure
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${qrCode.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${qrCode.description || 'QR Code Landing Page'}">
        ${logoUrl ? preloadAssets(logoUrl) : ''}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap">
        <style>
          ${criticalCSS}
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
        </style>
      </head>
      <body>
        <div class="container">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" loading="eager">` : ''}
          <h1 class="title">${qrCode.name}</h1>
          <div class="buttons">
            ${qrCode.buttons.map(button => `
              <a href="${button.url}" class="button" target="_blank" rel="noopener">
                ${button.text}
              </a>
            `).join('')}
          </div>
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

  res.send(html);
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
