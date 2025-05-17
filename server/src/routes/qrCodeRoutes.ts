import express, { Request, Response } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const router = express.Router();
const qrCodeRepository = AppDataSource.getRepository(QRCode);

// Public landing page route for QR code redirects (no auth required)
router.get('/view/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({ where: { id } });
    
    if (!qrCode) {
      return res.status(404).send('QR Code not found');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Click to Continue</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 90%;
              width: 400px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 1rem;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #0056b3;
            }
            h1 {
              margin: 0 0 1rem 0;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Click to Continue</h1>
            <a href="${qrCode.url}" class="button">Go to Destination</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error processing redirect');
  }
});

// Protected routes (require authentication)
router.post('/', auth, createQRCode);
router.get('/', auth, getQRCodes);
router.get('/:id', auth, getQRCode);
router.put('/:id', auth, updateQRCode);
router.delete('/:id', auth, deleteQRCode);

export default router; 