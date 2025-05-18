import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

export const getLandingPage = async (req: Request, res: Response) => {
    try {
        const { shortId } = req.params;
        
        // Find the QR code in the database
        const qrCodeRepository = AppDataSource.getRepository(QRCode);
        const qrCode = await qrCodeRepository.findOne({ where: { id: shortId } });

        if (!qrCode) {
            return res.status(404).send('QR Code not found');
        }

        // Render the landing page with the URL information
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QuickQR - Redirect</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        max-width: 500px;
                        width: 90%;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 1rem;
                        transition: background-color 0.3s;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .url {
                        word-break: break-all;
                        margin: 1rem 0;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>QuickQR Redirect</h1>
                    <p>You are about to be redirected to:</p>
                    <div class="url">${qrCode.originalUrl}</div>
                    <a href="${qrCode.originalUrl}" class="button">Continue to Website</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error in landing page:', error);
        res.status(500).send('Internal server error');
    }
}; 