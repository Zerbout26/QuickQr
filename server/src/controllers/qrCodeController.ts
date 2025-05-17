import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const qrCodeRepository = AppDataSource.getRepository(QRCode);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Get file extension
    const ext = path.extname(file.originalname);
    // Create a unique filename with timestamp and random number
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    // Create filename: originalname-timestamp-random.ext
    const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
}).single('logo');

export const createQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
      }

      try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const { name, url, foregroundColor, backgroundColor } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        // Get the origin from the request
        const origin = req.get('origin') || req.get('host');
        const baseUrl = origin ? `http://${origin}` : 'http://localhost:3000';
        console.log('Using base URL:', baseUrl);

        let logoUrl = undefined;
        if (req.file) {
          logoUrl = `${baseUrl}/uploads/logos/${req.file.filename}`;
          console.log('Generated logo URL:', logoUrl);
        }

        const qrCode = qrCodeRepository.create({
          name: name || 'My QR Code',
          url,
          logoUrl,
          foregroundColor: foregroundColor || '#000000',
          backgroundColor: backgroundColor || '#FFFFFF',
          user: req.user
        });

        const savedQRCode = await qrCodeRepository.save(qrCode);
        console.log('Saved QR code:', savedQRCode);
        
        // Create the landing page URL using the same base URL
        const landingPageUrl = `${baseUrl}/qrcodes/redirect/${savedQRCode.id}`;
        console.log('Generated landing page URL:', landingPageUrl);
        
        // Return the QR code data with the landing page URL
        const responseData = {
          ...savedQRCode,
          landingPageUrl
        };
        
        res.status(201).json(responseData);
      } catch (error) {
        console.error('Error creating QR code:', error);
        res.status(500).json({ error: 'Error creating QR code' });
      }
    });
  } catch (error) {
    console.error('Error in createQRCode:', error);
    res.status(500).json({ error: 'Error creating QR code' });
  }
};

export const getQRCodes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const qrCodes = await qrCodeRepository.find({
      where: { user: { id: req.user.id } },
      order: { createdAt: 'DESC' }
    });

    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching QR codes' });
  }
};

export const getQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching QR code' });
  }
};

export const updateQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { name, url, logoUrl, foregroundColor, backgroundColor } = req.body;

    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (name) qrCode.name = name;
    if (url) qrCode.url = url;
    if (logoUrl !== undefined) qrCode.logoUrl = logoUrl;
    if (foregroundColor) qrCode.foregroundColor = foregroundColor;
    if (backgroundColor) qrCode.backgroundColor = backgroundColor;

    await qrCodeRepository.save(qrCode);
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error updating QR code' });
  }
};

export const deleteQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    await qrCodeRepository.remove(qrCode);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting QR code' });
  }
}; 