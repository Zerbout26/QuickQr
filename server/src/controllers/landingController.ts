import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Cache for QR codes
const qrCodeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to darken a color
const darkenColor = (color: string, amount: number) => {
  // Remove # if present
  color = color.replace(/^#/, '');
  
  // Parse the color
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Darken each channel
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cachedData = qrCodeCache.get(id);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.send(cachedData.data);
    }

    const qrCode = await qrCodeRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        originalUrl: true,
        logoUrl: true,
        foregroundColor: true,
        backgroundColor: true,
        textAbove: true,
        textBelow: true,
        links: true,
        menu: true,
        scanCount: true,
        user: {
          id: true,
          isActive: true
        }
      }
    });

    if (!qrCode) {
      const notFoundHtml = `
        <html>
          <head>
            <title>QR Code Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap">
            <style>
              body {
                font-family: 'Cairo', system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f3f4f6;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                max-width: 90%;
                width: 400px;
                border-left: 4px solid #4A90E2;
              }
              h1 { color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem; }
              p { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>QR Code Not Found</h1>
              <p>The requested QR code does not exist or has been removed.</p>
            </div>
          </body>
        </html>
      `;
      qrCodeCache.set(id, { data: notFoundHtml, timestamp: Date.now() });
      return res.send(notFoundHtml);
    }

    // Check if user is active
    if (!qrCode.user.isActive) {
      // Redirect to payment instructions page
      const frontendDomain = process.env.FRONTEND_URL || 'http://localhost:8080';
      return res.redirect(`${frontendDomain}/payment-instructions`);
    }

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
    
    // Save the updated QR code asynchronously
    qrCodeRepository.save(qrCode).catch(error => {
      console.error('Error saving QR code scan:', error);
    });

    // Define primary color with fallback
    const primaryColor = qrCode.foregroundColor || '#4A90E2';
    
    // Generate HTML for the landing page with improved styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${qrCode.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap">
          <style>
            :root {
              --primary-color: ${primaryColor};
              --secondary-color: ${qrCode.backgroundColor || '#F4D03F'};
              --accent-color: #00BCD4;
              --background-color: ${qrCode.backgroundColor || '#FAFAFA'};
              --text-color: ${qrCode.foregroundColor || '#2C3E50'};
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
              background: linear-gradient(135deg, var(--background-color) 0%, 
                ${darkenColor(qrCode.backgroundColor || '#f9fafb', 0.1)} 100%);
            }
            
            .container {
              width: 100%;
              max-width: 800px;
              margin: 2rem auto;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.95);
              border-radius: var(--border-radius);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              backdrop-filter: blur(10px);
            }
            
            .logo {
              max-width: 200px;
              height: auto;
              margin: 0 auto 2rem;
              display: block;
            }
            
            .title {
              font-size: 2.5rem;
              font-weight: 700;
              color: var(--text-color);
              text-align: center;
              margin-bottom: 2rem;
            }
            
            .buttons {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1rem;
              margin-bottom: 2rem;
            }
            
            .button {
              display: inline-block;
              padding: 1rem 2rem;
              background: var(--primary-color);
              color: white;
              text-decoration: none;
              border-radius: var(--border-radius);
              text-align: center;
              font-weight: 600;
              transition: all 0.3s ease;
            }
            
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .button.pulse {
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            
            .menu-section {
              margin-top: 3rem;
            }
            
            .menu-header {
              font-size: 2rem;
              color: var(--text-color);
              text-align: center;
              margin-bottom: 1rem;
            }
            
            .menu-categories {
              display: grid;
              gap: 2rem;
            }
            
            .category {
              background: white;
              border-radius: var(--border-radius);
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .category-name {
              background: var(--primary-color);
              color: white;
              padding: 1rem;
              font-weight: 600;
              text-align: center;
            }
            
            .category-items {
              padding: 1rem;
            }
            
            .item {
              padding: 1rem;
              border-bottom: 1px solid var(--border-color);
            }
            
            .item:last-child {
              border-bottom: none;
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5rem;
            }
            
            .item-name {
              font-weight: 600;
              color: var(--text-color);
            }
            
            .item-price {
              color: var(--primary-color);
              font-weight: 600;
            }
            
            .item-description {
              color: var(--text-light);
              font-size: 0.9rem;
              margin-bottom: 0.5rem;
            }
            
            .item-image {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: var(--border-radius);
              margin-top: 0.5rem;
            }
            
            .footer {
              text-align: center;
              margin-top: 3rem;
              color: var(--text-light);
              font-size: 0.9rem;
            }
            
            @media (max-width: 640px) {
              .container {
                margin: 1rem;
                padding: 1rem;
              }
              
              .title {
                font-size: 2rem;
              }
              
              .menu-header {
                font-size: 1.5rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCode.logoUrl ? `<img src="${qrCode.logoUrl}" alt="Logo" class="logo" loading="lazy">` : ''}
            <h1 class="title">${qrCode.name}</h1>
            
            ${qrCode.links && qrCode.links.length > 0 ? `
              <div class="buttons">
                ${qrCode.links.map((link, index) => `
                  <a href="${link.url}" class="button${index === 0 ? ' pulse' : ''}" target="_blank" rel="noopener noreferrer">
                    ${link.label}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            
            ${qrCode.menu ? `
              <div class="menu-section">
                <h2 class="menu-header">${qrCode.menu.restaurantName || 'Menu'}</h2>
                ${qrCode.menu.description ? `<p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 0.95rem;">${qrCode.menu.description}</p>` : ''}
                
                <div class="menu-categories">
                  ${qrCode.menu.categories.map(category => `
                    <div class="category">
                      <div class="category-name">${category.name}</div>
                      <div class="category-items">
                        ${category.items.map(item => `
                          <div class="item">
                            <div class="item-header">
                              <div class="item-name">${item.name}</div>
                              <div class="item-price">$${item.price.toFixed(2)}</div>
                            </div>
                            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="item-image" loading="lazy">` : ''}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              Powered by QuickQR - Digital Solutions for Business
            </div>
          </div>
        </body>
      </html>
    `;

    // Cache the generated HTML
    qrCodeCache.set(id, { data: html, timestamp: Date.now() });

    res.send(html);
  } catch (error) {
    console.error('Error generating landing page:', error);
    res.status(500).send('Error generating landing page');
  }
};

