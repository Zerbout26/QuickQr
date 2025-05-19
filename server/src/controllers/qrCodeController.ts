import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode, QRCodeType } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

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

// Configure multer for item image uploads
const itemImageStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/items');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `item-${uniqueSuffix}${ext}`;
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

const uploadItemImage = multer({
  storage: itemImageStorage,
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
}).single('image');

export const uploadItemImageHandler = async (req: AuthRequest, res: Response) => {
  uploadItemImage(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const frontendDomain = (req as any).frontendDomain;
      const imageUrl = `${frontendDomain}/uploads/items/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error uploading item image:', error);
      res.status(500).json({ error: 'Error uploading item image' });
    }
  });
};

export const createQRCode = async (req: AuthRequest, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.user) {
        console.error('No user found in request');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      console.log('Request body:', req.body);
      console.log('Request file:', req.file);

      const { name, foregroundColor, backgroundColor, links, type, menu } = req.body;
      const frontendDomain = (req as any).frontendDomain;
      let logoUrl = '';

      // Handle logo upload if present
      if (req.file) {
        logoUrl = `${frontendDomain}/uploads/logos/${req.file.filename}`;
      }

      // Parse links if provided
      let parsedLinks = [];
      if (links) {
        try {
          parsedLinks = JSON.parse(links);
          console.log('Parsed links:', parsedLinks);
        } catch (e) {
          console.error('Error parsing links:', e);
          return res.status(400).json({ error: 'Invalid links format' });
        }
      }

      // Parse menu if provided
      let parsedMenu = null;
      if ((type === 'menu' || type === 'both') && menu) {
        try {
          parsedMenu = JSON.parse(menu);
          console.log('Parsed menu:', parsedMenu);
        } catch (e) {
          console.error('Error parsing menu:', e);
          return res.status(400).json({ error: 'Invalid menu format' });
        }
      }

      // Generate a temporary ID for the URL
      const tempId = crypto.randomUUID();
      const tempUrl = `${frontendDomain}/landing/${tempId}`;

      const qrCode = new QRCode();
      qrCode.name = name || 'My QR Code';
      qrCode.type = type || 'url';
      qrCode.links = parsedLinks;
      qrCode.menu = parsedMenu;
      qrCode.logoUrl = logoUrl;
      qrCode.foregroundColor = foregroundColor || '#6366F1';
      qrCode.backgroundColor = backgroundColor || '#FFFFFF';
      qrCode.user = req.user;
      qrCode.url = tempUrl;
      qrCode.originalUrl = tempUrl;

      console.log('Creating QR code:', qrCode);

      // Save the QR code
      const savedQRCode = await qrCodeRepository.save(qrCode);
      console.log('Saved QR code:', savedQRCode);

      // Update the URL with the actual ID
      savedQRCode.url = `${frontendDomain}/landing/${savedQRCode.id}`;
      savedQRCode.originalUrl = savedQRCode.url;

      // Save again with the updated URL
      const finalQRCode = await qrCodeRepository.save(savedQRCode);
      console.log('Final QR code:', finalQRCode);

      res.status(201).json(finalQRCode);
    } catch (error) {
      console.error('Error creating QR code:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ error: 'Error creating QR code' });
    }
  });
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
    const { name, url, logoUrl, foregroundColor, backgroundColor, links, type, menu } = req.body;

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
    if (type) qrCode.type = type as QRCodeType;
    
    if (links !== undefined) {
      try {
        qrCode.links = links ? JSON.parse(links) : [];
      } catch (e) {
        return res.status(400).json({ error: 'Invalid links format' });
      }
    }

    if (menu !== undefined && (type === 'menu' || type === 'both')) {
      try {
        qrCode.menu = menu ? JSON.parse(menu) : null;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid menu format' });
      }
    }

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

export const getPublicQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching public QR code:', error);
    res.status(500).json({ error: 'Error fetching QR code' });
  }
}; 