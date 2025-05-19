
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id }
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

    // Define primary color with fallback
    const primaryColor = qrCode.foregroundColor || '#5D5FEF';
    
    // Helper function to get social media icon
    const getSocialIcon = (url) => {
      const urlLower = url.toLowerCase();
      if (urlLower.includes('facebook') || urlLower.includes('fb.com')) {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        `;
      } else if (urlLower.includes('instagram') || urlLower.includes('ig.com')) {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
        `;
      } else if (urlLower.includes('twitter') || urlLower.includes('x.com')) {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
        `;
      } else {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        `;
      }
    };
    
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
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
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
            .icon {
              margin-right: 0.5rem;
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
              text-align: center;
            }
            .category-items {
              display: flex;
              flex-direction: column;
            }
            .item {
              padding: 1rem;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-content {
              flex: 1;
              text-align: left;
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
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 0.25rem;
              margin-left: 1rem;
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
                    ${getSocialIcon(link.url)}
                    ${link.label}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            
            ${qrCode.menu && qrCode.menu.categories.length > 0 ? `
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
                            <div class="item-content">
                              <div class="item-header">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">$${item.price.toFixed(2)}</div>
                              </div>
                              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                            </div>
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
