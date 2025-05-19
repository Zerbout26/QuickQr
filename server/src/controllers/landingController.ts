
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
    
    // Separate social media links from regular links
    const socialLinks = qrCode.links ? qrCode.links.filter(link => 
      link.url.includes('facebook') || 
      link.url.includes('instagram') || 
      link.url.includes('twitter') || 
      link.url.includes('linkedin')
    ) : [];

    const regularLinks = qrCode.links ? qrCode.links.filter(link => 
      !link.url.includes('facebook') && 
      !link.url.includes('instagram') && 
      !link.url.includes('twitter') && 
      !link.url.includes('linkedin')
    ) : [];

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
            .social-icons {
              display: flex;
              justify-content: center;
              gap: 1rem;
              margin-bottom: 1.5rem;
            }
            .social-icon {
              width: 40px;
              height: 40px;
              background-color: ${primaryColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-decoration: none;
              transition: transform 0.2s;
            }
            .social-icon:hover {
              transform: scale(1.1);
            }
            .social-icon svg {
              width: 20px;
              height: 20px;
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
            .divider {
              margin: 2rem 0;
              height: 1px;
              background-color: #e5e7eb;
              width: 100%;
            }
            .menu-section {
              margin-top: 2rem;
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
              gap: 0.5rem;
              padding: 0.5rem;
            }
            .menu-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: white;
              padding: 0.75rem;
              border-radius: 0.375rem;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .item-details {
              flex: 1;
              text-align: left;
            }
            .item-name {
              font-weight: 500;
              color: ${primaryColor};
              margin: 0;
              font-size: 0.875rem;
            }
            .item-price {
              font-weight: 500;
              margin: 0;
              font-size: 0.875rem;
            }
            .item-description {
              font-size: 0.75rem;
              color: #6b7280;
              margin: 0.25rem 0 0;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              max-width: calc(100% - 80px);
            }
            .item-image {
              width: 64px;
              height: 64px;
              object-fit: cover;
              border-radius: 0.25rem;
              margin-left: 1rem;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCode.logoUrl ? `<img src="${qrCode.logoUrl}" alt="Logo" class="logo">` : ''}
            <h1 class="title">${qrCode.name}</h1>
            
            ${socialLinks.length > 0 ? `
              <div class="social-icons">
                ${socialLinks.map(link => {
                  let icon = '';
                  if (link.url.includes('facebook')) {
                    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>';
                  } else if (link.url.includes('instagram')) {
                    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>';
                  } else if (link.url.includes('twitter')) {
                    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>';
                  } else if (link.url.includes('linkedin')) {
                    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>';
                  }
                  return `
                    <a href="${link.url}" class="social-icon" target="_blank" rel="noopener noreferrer">
                      ${icon}
                    </a>
                  `;
                }).join('')}
              </div>
            ` : ''}
            
            ${regularLinks.length > 0 ? `
              <div class="buttons">
                ${regularLinks.map(link => `
                  <a href="${link.url}" class="button" target="_blank" rel="noopener noreferrer">
                    ${link.label}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            
            ${(regularLinks.length > 0 || socialLinks.length > 0) && qrCode.menu && qrCode.menu.categories.length > 0 ? `
              <div class="divider"></div>
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
                          <div class="menu-item">
                            <div class="item-details">
                              <div class="item-header">
                                <h3 class="item-name">${item.name}</h3>
                                <p class="item-price">$${item.price.toFixed(2)}</p>
                              </div>
                              ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
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
