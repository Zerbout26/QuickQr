import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode, QRCodeType, MenuItem, MenuCategory } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      let uploadDir = path.join(__dirname, '../../uploads/logos'); // Default to logos directory
      if (file.fieldname === 'menuItemImages') {
        uploadDir = path.join(__dirname, '../../uploads/items');
      }
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      if (file.fieldname === 'logo') {
        const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      } else if (file.fieldname === 'menuItemImages') {
        const filename = `item-${uniqueSuffix}${ext}`;
        cb(null, filename);
      }
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'menuItemImages', maxCount: 20 } // Allow up to 20 menu item images
]);

const uploadItemImage = multer({
  storage: multer.diskStorage({
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
  }),
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

      // Use the server's domain for image URLs
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${serverUrl}/uploads/items/${req.file.filename}`;
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
      console.log('Request files:', req.files);

      const { name, foregroundColor, backgroundColor, links, type, menu, textAbove, textBelow, url } = req.body;
      const frontendDomain = (req as any).frontendDomain;
      let logoUrl = '';

      // Handle logo upload if present
      if (req.files && (req.files as any)['logo']) {
        const logoFile = (req.files as any)['logo'][0];
        logoUrl = await uploadToCloudinary(logoFile);
      }

      // Parse links if provided
      let parsedLinks = [];
      if (links) {
        try {
          parsedLinks = JSON.parse(links);
        } catch (e) {
          console.error('Error parsing links:', e);
          return res.status(400).json({ error: 'Invalid links format' });
        }
      }

      // Parse menu if provided
      let parsedMenu: { restaurantName: string; description?: string; categories: MenuCategory[] } | null = null;
      if ((type === 'menu' || type === 'both') && menu) {
        try {
          parsedMenu = JSON.parse(menu) as { restaurantName: string; description?: string; categories: MenuCategory[] };
          
          // Handle menu item images
          if (req.files && (req.files as any)['menuItemImages']) {
            const menuItemImages = (req.files as any)['menuItemImages'];
            for (let i = 0; i < menuItemImages.length; i++) {
              const imageFile = menuItemImages[i];
              try {
                // Upload image to Cloudinary
                const imageUrl = await uploadToCloudinary(imageFile);
                
                // Extract category and item indices from the filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 2) {
                  const categoryIndex = parseInt(parts[0], 10);
                  const itemIndex = parseInt(parts[1], 10);
                  
                  if (!isNaN(categoryIndex) && !isNaN(itemIndex) &&
                      parsedMenu.categories[categoryIndex] && 
                      parsedMenu.categories[categoryIndex].items[itemIndex]) {
                    parsedMenu.categories[categoryIndex].items[itemIndex].imageUrl = imageUrl;
                  }
                }
              } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                // Continue with other images even if one fails
                continue;
              }
            }
          }
        } catch (e) {
          console.error('Error parsing menu:', e);
          return res.status(400).json({ error: 'Invalid menu format' });
        }
      }

      const qrCode = new QRCode();
      qrCode.name = name || 'My QR Code';
      qrCode.type = type || 'url';
      qrCode.links = parsedLinks;
      qrCode.menu = parsedMenu || { restaurantName: '', categories: [] };
      qrCode.logoUrl = logoUrl;
      qrCode.foregroundColor = foregroundColor || '#6366F1';
      qrCode.backgroundColor = backgroundColor || '#FFFFFF';
      qrCode.textAbove = textAbove || 'Scan me';
      qrCode.textBelow = textBelow || '';
      qrCode.user = req.user;

      if (type === 'direct' && url) {
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        qrCode.url = `${serverUrl}/api/qrcodes/redirect/${encodeURIComponent(url)}`;
        qrCode.originalUrl = url;
      } else {
        const tempId = crypto.randomUUID();
        const tempUrl = `${frontendDomain}/landing/${tempId}`;
        qrCode.url = tempUrl;
        qrCode.originalUrl = tempUrl;

        const savedQRCode = await qrCodeRepository.save(qrCode);
        savedQRCode.url = `${frontendDomain}/landing/${savedQRCode.id}`;
        savedQRCode.originalUrl = savedQRCode.url;
        const finalQRCode = await qrCodeRepository.save(savedQRCode);
        return res.status(201).json(finalQRCode);
      }

      const savedQRCode = await qrCodeRepository.save(qrCode);
      res.status(201).json(savedQRCode);

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

    // Delete logo from Cloudinary if exists
    if (qrCode.logoUrl) {
      const publicId = qrCode.logoUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Delete menu item images from Cloudinary if they exist
    if (qrCode.menu && qrCode.menu.categories) {
      for (const category of qrCode.menu.categories) {
        for (const item of category.items) {
          if (item.imageUrl) {
            const publicId = item.imageUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }
        }
      }
    }

    await qrCodeRepository.remove(qrCode);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Error deleting QR code' });
  }
};

export const getPublicQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if user is active
    if (!qrCode.user.isActive) {
      return res.status(403).json({ error: 'QR code is not accessible. User account is not active.' });
    }

    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching public QR code:', error);
    res.status(500).json({ error: 'Error fetching QR code' });
  }
};

export const redirectToUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.params;
    const decodedUrl = decodeURIComponent(url);
    
    // Validate URL
    try {
      new URL(decodedUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Find the QR code that contains this URL
    const qrCode = await qrCodeRepository.findOne({
      where: [
        { originalUrl: decodedUrl },
        { url: decodedUrl }
      ],
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if user is active
    if (!qrCode.user.isActive) {
      return res.status(403).json({ error: 'QR code is not accessible. User account is not active.' });
    }

    // Increment scan count and log scan history
    qrCode.scanCount = (qrCode.scanCount || 0) + 1;
    qrCode.scanHistory = qrCode.scanHistory || [];
    qrCode.scanHistory.push({
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || 'Unknown'
    });
    
    // Save the updated QR code
    await qrCodeRepository.save(qrCode);

    // Redirect to the original URL
    res.redirect(decodedUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Error redirecting to URL' });
  }
};

export const incrementScanCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
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
    
    // Save the updated QR code
    await qrCodeRepository.save(qrCode);

    res.json({ success: true, scanCount: qrCode.scanCount });
  } catch (error) {
    console.error('Error incrementing scan count:', error);
    res.status(500).json({ message: 'Error incrementing scan count' });
  }
}; 