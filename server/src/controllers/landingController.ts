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
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 { color: #1f2937; margin-bottom: 1rem; }
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

    // Generate HTML for the landing page
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
              background-color: #f3f4f6;
            }
            .container {
              width: 100%;
              max-width: 600px;
              padding: 2rem;
              text-align: center;
            }
            .logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 2rem;
            }
            .buttons {
              display: flex;
              flex-direction: column;
              gap: 1rem;
              width: 100%;
            }
            .button {
              display: inline-block;
              padding: 1rem 2rem;
              background-color: ${qrCode.foregroundColor || '#6366F1'};
              color: white;
              text-decoration: none;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: opacity 0.2s;
            }
            .button:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${qrCode.logoUrl ? `<img src="${qrCode.logoUrl}" alt="Logo" class="logo">` : ''}
            <div class="buttons">
              ${qrCode.links?.map(link => `
                <a href="${link.url}" class="button" target="_blank" rel="noopener noreferrer">
                  ${link.label}
                </a>
              `).join('') || ''}
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