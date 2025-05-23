import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode, QRCodeType, MenuItem, MenuCategory } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
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
  storage: multer.memoryStorage(),
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

      // Upload directly to Cloudinary
      const result = await uploadToCloudinary(req.file);
      res.json({ imageUrl: result.url });
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

      const { name, foregroundColor, backgroundColor, links, type, menu, textAbove, textBelow, url } = req.body;
      const frontendDomain = (req as any).frontendDomain;
      let logoUrl = '';
      let logoPublicId = '';

      // Handle logo upload if present
      if (req.files && (req.files as any)['logo']) {
        const logoFile = (req.files as any)['logo'][0];
        const result = await uploadToCloudinary(logoFile);
        logoUrl = result.url;
        logoPublicId = result.publicId;
      }

      // Parse links if provided
      let parsedLinks: { label: string; url: string; type: string }[] = [];
      if (links) {
        try {
          parsedLinks = JSON.parse(links);
        } catch (e) {
          console.error('Error parsing links:', e);
          return res.status(400).json({ error: 'Invalid links format' });
        }
      }

      // Parse menu if provided
      let parsedMenu: { restaurantName: string; description?: string; categories: MenuCategory[] } | undefined = undefined;
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
                const result = await uploadToCloudinary(imageFile);
                
                // Extract category and item indices from the filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 2) {
                  const categoryIndex = parseInt(parts[0], 10);
                  const itemIndex = parseInt(parts[1], 10);
                  
                  if (!isNaN(categoryIndex) && !isNaN(itemIndex) &&
                      parsedMenu.categories[categoryIndex] && 
                      parsedMenu.categories[categoryIndex].items[itemIndex]) {
                    // Update the imageUrl in the menu item
                    parsedMenu.categories[categoryIndex].items[itemIndex].imageUrl = result.url;
                    parsedMenu.categories[categoryIndex].items[itemIndex].imagePublicId = result.publicId;
                    console.log(`Updated image URL for category ${categoryIndex}, item ${itemIndex}: ${result.url}`);
                  } else {
                    console.warn(`Invalid indices in filename: ${filename}`);
                  }
                } else {
                  console.warn(`Invalid filename format: ${filename}`);
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

      // Create QR code with required fields
      const qrCode = qrCodeRepository.create({
        name: name || 'My QR Code',
        type: (type || 'url') as QRCodeType,
        url: url || `${frontendDomain}/landing/${crypto.randomUUID()}`,
        originalUrl: url || '',
        logoUrl: logoUrl || '',
        logoPublicId: logoPublicId || '',
        foregroundColor: foregroundColor || '#000000',
        backgroundColor: backgroundColor || '#FFFFFF',
        textAbove: textAbove || '',
        textBelow: textBelow || '',
        links: parsedLinks || [],
        menu: parsedMenu,
        user: req.user
      });

      // Save QR code
      const savedQRCode = await qrCodeRepository.save(qrCode);
      res.status(201).json(savedQRCode);
    } catch (error) {
      console.error('Error creating QR code:', error);
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
    console.error('Error fetching QR codes:', error);
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

    console.log('Update request body:', req.body); // Debug log

    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Update basic fields
    if (name !== undefined) qrCode.name = name;
    if (url !== undefined) qrCode.url = url;
    if (logoUrl !== undefined) qrCode.logoUrl = logoUrl;
    if (foregroundColor !== undefined) qrCode.foregroundColor = foregroundColor;
    if (backgroundColor !== undefined) qrCode.backgroundColor = backgroundColor;
    if (type !== undefined) qrCode.type = type as QRCodeType;
    
    // Handle links
    if (links !== undefined) {
      try {
        // If links is already an array, use it directly
        qrCode.links = Array.isArray(links) ? links : JSON.parse(links);
      } catch (e) {
        console.error('Error parsing links:', e);
        return res.status(400).json({ error: 'Invalid links format' });
      }
    }

    // Handle menu
    if (menu !== undefined && (type === 'menu' || type === 'both')) {
      try {
        // If menu is already an object, use it directly
        qrCode.menu = typeof menu === 'object' ? menu : JSON.parse(menu);
      } catch (e) {
        console.error('Error parsing menu:', e);
        return res.status(400).json({ error: 'Invalid menu format' });
      }
    }

    // Save the updated QR code
    const updatedQRCode = await qrCodeRepository.save(qrCode);
    console.log('Updated QR code:', updatedQRCode); // Debug log

    res.json(updatedQRCode);
  } catch (error) {
    console.error('Error updating QR code:', error);
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

    try {
      // Delete logo from Cloudinary if exists
      if (qrCode.logoPublicId) {
        await deleteFromCloudinary(qrCode.logoPublicId);
      }

      // Delete menu item images from Cloudinary if they exist
      if (qrCode.menu && qrCode.menu.categories) {
        for (const category of qrCode.menu.categories) {
          if (category.items) {
            for (const item of category.items) {
              if (item.imagePublicId) {
                try {
                  await deleteFromCloudinary(item.imagePublicId);
                } catch (imageError) {
                  console.error('Error deleting menu item image:', imageError);
                  // Continue with other images even if one fails
                }
              }
            }
          }
        }
      }

      // Delete the QR code from the database
      await qrCodeRepository.remove(qrCode);
      res.status(204).send();
    } catch (deleteError) {
      console.error('Error during deletion process:', deleteError);
      throw deleteError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Error deleting QR code' });
  }
};

export const getPublicQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'QR code ID is required' });
    }

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

    // Return the QR code data without sensitive information
    const publicQRCode = {
      id: qrCode.id,
      name: qrCode.name,
      type: qrCode.type,
      url: qrCode.url,
      originalUrl: qrCode.originalUrl,
      logoUrl: qrCode.logoUrl,
      foregroundColor: qrCode.foregroundColor,
      backgroundColor: qrCode.backgroundColor,
      textAbove: qrCode.textAbove,
      textBelow: qrCode.textBelow,
      links: qrCode.links,
      menu: qrCode.menu,
      scanCount: qrCode.scanCount || 0
    };

    res.json(publicQRCode);
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