
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).send(`
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
                border-left: 4px solid #cc2828;
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
      `);
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
    
    // Save the updated QR code and wait for it to complete
    await qrCodeRepository.save(qrCode);

    // Define primary color with fallback
    const primaryColor = qrCode.foregroundColor || '#cc2828';
    
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
              --secondary-color: ${qrCode.backgroundColor || '#147828'};
              --accent-color: #e6a80c;
              --background-color: ${qrCode.backgroundColor || '#f9fafb'};
              --text-color: #1f2937;
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
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border-color: var(--primary-color);
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
              align-items: center;
            }
            
            .item-name {
              font-weight: 600;
              color: var(--primary-color);
            }
            
            .item-price {
              font-weight: 600;
              color: var(--secondary-color);
            }
            
            .item-description {
              font-size: 0.85rem;
              color: var(--text-light);
              margin-bottom: 0.75rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .item-image {
              width: 100%;
              height: 120px;
              object-fit: cover;
              border-radius: 0.25rem;
              margin-top: 0.5rem;
              transition: transform 0.3s;
            }
            
            .item-image:hover {
              transform: scale(1.05);
            }
            
            .footer {
              margin-top: 2rem;
              text-align: center;
              font-size: 0.75rem;
              color: var(--text-light);
            }
            
            .pulse {
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCode.logoUrl ? `<img src="${qrCode.logoUrl}" alt="Logo" class="logo">` : ''}
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

    res.send(html);
  } catch (error) {
    console.error('Error generating landing page:', error);
    res.status(500).send('Error generating landing page');
  }
};

// Helper function to darken a color
function darkenColor(hex: string, amount: number): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the color
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each channel
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
