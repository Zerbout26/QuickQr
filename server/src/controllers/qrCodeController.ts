import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode, QRCodeType, MenuItem, MenuCategory } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { upload, uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } from '../config/cloudinary';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Configure multer for file uploads
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'menuItemImages', maxCount: 20 }, // Allow up to 20 menu item images
  { name: 'vitrineImages', maxCount: 20 } // Allow up to 20 vitrine images
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
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary and get the URL
    const imageUrl = await uploadToCloudinary(req.file);
    
    // Get optimized URL for the image
    const optimizedUrl = getOptimizedUrl(imageUrl, {
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto'
    });

    res.json({ imageUrl: optimizedUrl });
  } catch (error) {
    console.error('Error uploading item image:', error);
    res.status(500).json({ error: 'Error uploading item image' });
  }
};

export const createQRCode = async (req: AuthRequest, res: Response) => {
  uploadFields(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.user) {
        console.error('No user found in request');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, foregroundColor, backgroundColor, links, type, menu, textAbove, textBelow, url, vitrine } = req.body;
      const frontendDomain = (req as any).frontendDomain;
      let logoUrl = '';
      const qrCodeData: any = {};

      // Handle logo upload if present
      if (req.files && (req.files as any)['logo']) {
        const logoFile = (req.files as any)['logo'][0];
        logoUrl = await uploadToCloudinary(logoFile);
        // Get optimized URL for the logo
        logoUrl = getOptimizedUrl(logoUrl, {
          width: 200,
          height: 200,
          crop: 'fill',
          quality: 'auto'
        });
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
                
                // Get optimized URL for the menu item image
                const optimizedUrl = getOptimizedUrl(imageUrl, {
                  width: 500,
                  height: 500,
                  crop: 'fill',
                  quality: 'auto'
                });
                
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
                    parsedMenu.categories[categoryIndex].items[itemIndex].imageUrl = optimizedUrl;
                    console.log(`Updated image URL for category ${categoryIndex}, item ${itemIndex}: ${optimizedUrl}`);
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

      // Handle vitrine images
      if (req.files && 'vitrineImages' in req.files) {
        const vitrineImages = req.files['vitrineImages'] as Express.Multer.File[];
        const vitrine = JSON.parse(req.body.vitrine);

        // Upload images to Cloudinary and update URLs
        for (const file of vitrineImages) {
          try {
            const imageUrl = await uploadToCloudinary(file);
            if (imageUrl) {
              const optimizedUrl = getOptimizedUrl(imageUrl, {
                width: 800,
                height: 600,
                crop: 'fill',
                quality: 'auto'
              });
              
              // Extract section and index from filename (format: section-index-timestamp-filename)
              const [section, index] = file.originalname.split('-');
              
              if (section === 'service' && vitrine.services[parseInt(index)]) {
                vitrine.services[parseInt(index)].imageUrl = optimizedUrl;
              } else if (section === 'gallery' && vitrine.gallery[parseInt(index)]) {
                vitrine.gallery[parseInt(index)].imageUrl = optimizedUrl;
              }
            }
          } catch (error) {
            console.error('Error uploading vitrine image to Cloudinary:', error);
          }
        }

        // Update the vitrine data with the new image URLs
        qrCodeData.vitrine = vitrine;
      }

      const qrCode = new QRCode();
      qrCode.name = name || 'My QR Code';
      qrCode.type = type || 'url';
      qrCode.links = parsedLinks;
      qrCode.menu = parsedMenu || { restaurantName: '', categories: [] };
      qrCode.vitrine = qrCodeData.vitrine;
      qrCode.logoUrl = logoUrl;
      qrCode.foregroundColor = foregroundColor || '#6366F1';
      qrCode.backgroundColor = backgroundColor || '#FFFFFF';
      qrCode.textAbove = textAbove || 'Scan me';
      qrCode.textBelow = textBelow || '';
      qrCode.user = req.user;

      if (type === 'direct' && url) {
        const tempId = crypto.randomUUID();
        const tempUrl = `${frontendDomain}/landing/${tempId}`;
        qrCode.url = tempUrl;
        qrCode.originalUrl = url;  // Store the original URL for redirection
        qrCode.type = 'direct';    // Ensure type is set to direct

        const savedQRCode = await qrCodeRepository.save(qrCode);
        savedQRCode.url = `${frontendDomain}/landing/${savedQRCode.id}`;
        const finalQRCode = await qrCodeRepository.save(savedQRCode);
        return res.status(201).json(finalQRCode);
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
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        originalUrl: true,
        logoUrl: true,
        foregroundColor: true,
        backgroundColor: true,
        menu: true,
        vitrine: true,
        links: true,
        scanCount: true,
        createdAt: true,
        updatedAt: true
      },
      where: { id, user: { id: req.user.id } },
      relations: ['user']
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
  uploadFields(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { name, foregroundColor, backgroundColor, links, type, menu, vitrine } = req.body;
      let logoUrl = '';

      const qrCode = await qrCodeRepository.findOne({
        where: { id, user: { id: req.user.id } }
      });

      if (!qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      // Handle logo upload if present
      if (req.files && (req.files as any)['logo']) {
        // Delete old logo if exists
        if (qrCode.logoUrl) {
          const publicId = qrCode.logoUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }

        const logoFile = (req.files as any)['logo'][0];
        logoUrl = await uploadToCloudinary(logoFile);
        // Get optimized URL for the logo
        logoUrl = getOptimizedUrl(logoUrl, {
          width: 200,
          height: 200,
          crop: 'fill',
          quality: 'auto'
        });
        qrCode.logoUrl = logoUrl;
      }

      // Update basic fields
      if (name !== undefined) qrCode.name = name;
      if (foregroundColor !== undefined) qrCode.foregroundColor = foregroundColor;
      if (backgroundColor !== undefined) qrCode.backgroundColor = backgroundColor;
      if (type !== undefined) qrCode.type = type as QRCodeType;
      
      // Handle links
      if (links !== undefined) {
        try {
          qrCode.links = Array.isArray(links) ? links : JSON.parse(links);
        } catch (e) {
          console.error('Error parsing links:', e);
          return res.status(400).json({ error: 'Invalid links format' });
        }
      }

      // Handle menu
      if (menu !== undefined && (type === 'menu' || type === 'both')) {
        try {
          const parsedMenu = typeof menu === 'object' ? menu : JSON.parse(menu);
          
          // Handle menu item images
          if (req.files && (req.files as any)['menuItemImages']) {
            const menuItemImages = (req.files as any)['menuItemImages'];
            for (let i = 0; i < menuItemImages.length; i++) {
              const imageFile = menuItemImages[i];
              try {
                // Upload image to Cloudinary
                const imageUrl = await uploadToCloudinary(imageFile);
                
                // Get optimized URL for the menu item image
                const optimizedUrl = getOptimizedUrl(imageUrl, {
                  width: 500,
                  height: 500,
                  crop: 'fill',
                  quality: 'auto'
                });
                
                // Extract category and item indices from the filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 2) {
                  const categoryIndex = parseInt(parts[0], 10);
                  const itemIndex = parseInt(parts[1], 10);
                  
                  if (!isNaN(categoryIndex) && !isNaN(itemIndex) &&
                      parsedMenu.categories[categoryIndex] && 
                      parsedMenu.categories[categoryIndex].items[itemIndex]) {
                    // Delete old image if exists
                    const oldImageUrl = parsedMenu.categories[categoryIndex].items[itemIndex].imageUrl;
                    if (oldImageUrl) {
                      const publicId = oldImageUrl.split('/').pop()?.split('.')[0];
                      if (publicId) {
                        await deleteFromCloudinary(publicId);
                      }
                    }
                    // Update the imageUrl in the menu item
                    parsedMenu.categories[categoryIndex].items[itemIndex].imageUrl = optimizedUrl;
                  }
                }
              } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                continue;
              }
            }
          }
          
          qrCode.menu = parsedMenu;
        } catch (e) {
          console.error('Error parsing menu:', e);
          return res.status(400).json({ error: 'Invalid menu format' });
        }
      }

      // Handle vitrine
      if (vitrine !== undefined && type === 'vitrine') {
        try {
          const parsedVitrine = typeof vitrine === 'object' ? vitrine : JSON.parse(vitrine);
          
          // Handle vitrine images (gallery, services, etc.)
          if (req.files && (req.files as any)['vitrineImages']) {
            const vitrineImages = (req.files as any)['vitrineImages'];
            for (let i = 0; i < vitrineImages.length; i++) {
              const imageFile = vitrineImages[i];
              try {
                // Upload image to Cloudinary
                const imageUrl = await uploadToCloudinary(imageFile);
                
                // Get optimized URL for the image
                const optimizedUrl = getOptimizedUrl(imageUrl, {
                  width: 800,
                  height: 600,
                  crop: 'fill',
                  quality: 'auto'
                });
                
                // Extract section and index from filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 2) {
                  const section = parts[0]; // gallery, services, etc.
                  const index = parseInt(parts[1], 10);
                  
                  if (!isNaN(index) && parsedVitrine[section]) {
                    // Update the imageUrl in the appropriate section
                    if (Array.isArray(parsedVitrine[section])) {
                      if (parsedVitrine[section][index]) {
                        parsedVitrine[section][index].imageUrl = optimizedUrl;
                      }
                    }
                  }
                }
              } catch (uploadError) {
                console.error('Error uploading vitrine image to Cloudinary:', uploadError);
                continue;
              }
            }
          }
          
          qrCode.vitrine = parsedVitrine;
        } catch (e) {
          console.error('Error parsing vitrine:', e);
          return res.status(400).json({ error: 'Invalid vitrine format' });
        }
      }

      // Save the updated QR code
      const updatedQRCode = await qrCodeRepository.save(qrCode);
      res.json(updatedQRCode);
    } catch (error) {
      console.error('Error updating QR code:', error);
      res.status(500).json({ error: 'Error updating QR code' });
    }
  });
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
      if (qrCode.logoUrl) {
        const publicId = qrCode.logoUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }

      // Delete menu item images from Cloudinary if they exist
      if (qrCode.menu && qrCode.menu.categories) {
        for (const category of qrCode.menu.categories) {
          if (category.items) {
            for (const item of category.items) {
              if (item.imageUrl) {
                try {
                  const publicId = item.imageUrl.split('/').pop()?.split('.')[0];
                  if (publicId) {
                    await deleteFromCloudinary(publicId);
                  }
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
      vitrine: qrCode.vitrine,
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

    // Find the QR code that contains this URL with optimized query
    const qrCode = await qrCodeRepository.findOne({
      select: {
        id: true,
        scanCount: true,
        scanHistory: true,
        user: {
          id: true,
          isActive: true
        }
      },
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

    // Use a more efficient update query
    await qrCodeRepository
      .createQueryBuilder()
      .update(QRCode)
      .set({
        scanCount: () => 'scan_count + 1',
        scanHistory: () => `array_append(scan_history, :history)`
      })
      .where('id = :id', { id: qrCode.id })
      .setParameter('history', JSON.stringify({
        timestamp: new Date(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      }))
      .execute();

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