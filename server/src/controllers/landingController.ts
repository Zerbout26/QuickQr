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
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
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
    const primaryColor = qrCode.foregroundColor || '#5D5FEF';
    
    // Generate HTML for the landing page with improved styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${qrCode.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, ${qrCode.backgroundColor || '#f9fafb'} 0%, 
                ${darkenColor(qrCode.backgroundColor || '#f9fafb', 0.1)} 100%);
            }
            .container {
              width: 100%;
              max-width: 600px;
              padding: 2rem;
              text-align: center;
              background: white;
              border-radius: 0.75rem;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              margin: 1rem;
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
              font-weight: 600;
              color: ${primaryColor};
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
              background-color: ${primaryColor};
              color: white;
              text-decoration: none;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: all 0.2s;
            }
            .button:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
            .menu-section {
              margin-top: 2rem;
              border-top: 1px solid #e5e7eb;
              padding-top: 1.5rem;
              width: 100%;
            }
            .menu-header {
              color: ${primaryColor};
              font-size: 1.25rem;
              margin-bottom: 1rem;
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
            }
            .category-name {
              background-color: ${primaryColor};
              color: white;
              padding: 0.5rem;
              font-size: 1rem;
              font-weight: 500;
            }
            .category-items {
              display: grid;
              grid-template-columns: 1fr;
              gap: 0.5rem;
              padding: 0.5rem;
            }
            @media (min-width: 480px) {
              .category-items {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            .item {
              background: white;
              padding: 0.5rem;
              border-radius: 0.375rem;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.25rem;
            }
            .item-name {
              font-weight: 500;
              color: ${primaryColor};
            }
            .item-price {
              font-weight: 500;
            }
            .item-description {
              font-size: 0.75rem;
              color: #6b7280;
              margin-bottom: 0.5rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .item-image {
              width: 100%;
              height: 100px;
              object-fit: cover;
              border-radius: 0.25rem;
              margin-top: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCode.logoUrl ? `<img src="${qrCode.logoUrl}" alt="Logo" class="logo">` : ''}
            <h1 class="title">${qrCode.name}</h1>
            
            ${qrCode.links && qrCode.links.length > 0 ? `
              <div class="buttons">
                ${qrCode.links.map(link => `
                  <a href="${link.url}" class="button" target="_blank" rel="noopener noreferrer">
                    ${link.label}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            
            ${qrCode.menu ? `
              <div class="menu-section">
                <h2 class="menu-header">${qrCode.menu.restaurantName || 'Menu'}</h2>
                ${qrCode.menu.description ? `<p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.875rem;">${qrCode.menu.description}</p>` : ''}
                
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
                            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="item-image">` : ''}
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
