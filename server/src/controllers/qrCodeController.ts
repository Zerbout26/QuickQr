import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode, QRCodeType, MenuItem, MenuCategory } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { upload, uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } from '../config/cloudinary';
import { User } from '../models/User';
import { ILike } from 'typeorm';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const userRepository = AppDataSource.getRepository(User);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Function to generate dynamic background gradient based on user colors
const generateDynamicBackground = (primaryColor: string, accentColor: string): string => {
  // Convert hex to RGB for better gradient control
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const primaryRgb = hexToRgb(primaryColor);
  const accentRgb = hexToRgb(accentColor);

  if (!primaryRgb || !accentRgb) {
    // Fallback to default gradient if color parsing fails
    return 'linear-gradient(135deg, #8b5cf615 0%, #8b5cf608 25%, white 50%, #ec489908 75%, #ec489915 100%)';
  }

  // Check if primary and accent colors are the same
  const isSameColor = primaryColor.toLowerCase() === accentColor.toLowerCase();
  
  if (isSameColor) {
    // When colors are the same, create a monochromatic gradient
    const colorIntensity = (primaryRgb.r + primaryRgb.g + primaryRgb.b) / 3;
    
    if (colorIntensity > 200) {
      // Light colors - create subtle gradient with white
      return `linear-gradient(135deg, 
        ${primaryColor}30 0%, 
        ${primaryColor}20 25%, 
        white 50%, 
        ${primaryColor}20 75%, 
        ${primaryColor}30 100%
      )`;
    } else if (colorIntensity > 150) {
      // Medium-light colors - more pronounced gradient
      return `linear-gradient(135deg, 
        ${primaryColor}40 0%, 
        ${primaryColor}25 30%, 
        white 60%, 
        ${primaryColor}25 80%, 
        ${primaryColor}40 100%
      )`;
    } else {
      // Dark colors - subtle gradient
      return `linear-gradient(135deg, 
        ${primaryColor}25 0%, 
        ${primaryColor}15 30%, 
        white 60%, 
        ${primaryColor}15 80%, 
        ${primaryColor}25 100%
      )`;
    }
  }

  // Different colors - create multiple gradient options
  const gradients = [
    // Option 1: Diagonal gradient with degradation
    `linear-gradient(135deg, 
      ${primaryColor}25 0%, 
      ${primaryColor}15 20%, 
      white 50%, 
      ${accentColor}15 80%, 
      ${accentColor}25 100%
    )`,
    
    // Option 2: Radial gradient for more organic feel
    `radial-gradient(ellipse at center, 
      ${primaryColor}20 0%, 
      ${primaryColor}12 30%, 
      white 60%, 
      ${accentColor}12 80%, 
      ${accentColor}20 100%
    )`,
    
    // Option 3: Multi-stop gradient for more complex degradation
    `linear-gradient(135deg, 
      ${primaryColor}30 0%, 
      ${primaryColor}20 15%, 
      ${primaryColor}10 30%, 
      white 50%, 
      ${accentColor}10 70%, 
      ${accentColor}20 85%, 
      ${accentColor}30 100%
    )`
  ];

  // Choose gradient based on color intensity
  const colorIntensity = (primaryRgb.r + primaryRgb.g + primaryRgb.b) / 3;
  const accentIntensity = (accentRgb.r + accentRgb.g + accentRgb.b) / 3;
  
  // Use different gradients based on color characteristics
  if (colorIntensity < 128 && accentIntensity < 128) {
    // Dark colors - use more subtle gradient
    return gradients[0];
  } else if (Math.abs(colorIntensity - accentIntensity) > 100) {
    // High contrast colors - use radial gradient
    return gradients[1];
  } else {
    // Similar intensity colors - use multi-stop gradient
    return gradients[2];
  }
};

// Configure multer for file uploads
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'menuItemImages', maxCount: 20 }, // Allow up to 20 menu item images
  { name: 'productImages', maxCount: 20 }, // Allow up to 20 product images
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

      const { name, foregroundColor, backgroundColor, links, type, menu, textAbove, textBelow, url, vitrine, products } = req.body;
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
      let parsedMenu: { restaurantName: string; description?: string; categories: MenuCategory[]; orderable?: boolean; codFormEnabled?: boolean } | null = null;
      if ((type === 'menu' || type === 'both') && menu) {
        try {
          parsedMenu = JSON.parse(menu) as { restaurantName: string; description?: string; categories: MenuCategory[]; orderable?: boolean; codFormEnabled?: boolean };
          
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
                if (parts.length >= 4) {
                  const categoryIndex = parseInt(parts[1], 10);
                  const itemIndex = parseInt(parts[2], 10);
                  const imageIndex = parseInt(parts[3], 10);
                  
                  if (!isNaN(categoryIndex) && !isNaN(itemIndex) && !isNaN(imageIndex) &&
                      parsedMenu.categories[categoryIndex] && 
                      parsedMenu.categories[categoryIndex].items[itemIndex]) {
                    
                    const menuItem = parsedMenu.categories[categoryIndex].items[itemIndex];
                    
                    // Initialize images array if it doesn't exist
                    if (!menuItem.images) {
                      menuItem.images = [];
                    }
                    
                    // Replace the blob URL at the specific index with the Cloudinary URL
                    if (menuItem.images[imageIndex]) {
                      menuItem.images[imageIndex] = optimizedUrl;
                    } else {
                      // If the index doesn't exist, push to the end
                      menuItem.images.push(optimizedUrl);
                    }
                    
                    // Also update imageUrl for backward compatibility (use the first image)
                    if (menuItem.images.length > 0) {
                      menuItem.imageUrl = menuItem.images[0];
                    }
                    
                    console.log(`Updated images array for category ${categoryIndex}, item ${itemIndex}: ${JSON.stringify(menuItem.images)}`);
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

      // Parse products if provided
      let parsedProducts: { storeName?: string; currency?: string; orderable?: boolean; codFormEnabled?: boolean; products: MenuItem[] } | null = null;
      if (type === 'products' && products) {
        try {
          parsedProducts = JSON.parse(products) as { storeName?: string; currency?: string; orderable?: boolean; codFormEnabled?: boolean; products: MenuItem[] };
          
          // Handle product images
          if (req.files && (req.files as any)['productImages']) {
            const productImages = (req.files as any)['productImages'];
            for (let i = 0; i < productImages.length; i++) {
              const imageFile = productImages[i];
              try {
                // Upload image to Cloudinary
                const imageUrl = await uploadToCloudinary(imageFile);
                
                // Get optimized URL for the product image
                const optimizedUrl = getOptimizedUrl(imageUrl, {
                  width: 500,
                  height: 500,
                  crop: 'fill',
                  quality: 'auto'
                });
                
                // Extract product and image indices from the filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 3) {
                  const productIndex = parseInt(parts[1], 10);
                  const imageIndex = parseInt(parts[2], 10);
                  
                  if (!isNaN(productIndex) && !isNaN(imageIndex) &&
                      parsedProducts.products[productIndex]) {
                    
                    const product = parsedProducts.products[productIndex];
                    
                    // Initialize images array if it doesn't exist
                    if (!product.images) {
                      product.images = [];
                    }
                    
                    // Replace the blob URL at the specific index with the Cloudinary URL
                    if (product.images[imageIndex]) {
                      product.images[imageIndex] = optimizedUrl;
                    } else {
                      // If the index doesn't exist, push to the end
                      product.images.push(optimizedUrl);
                    }
                    
                    // Also update imageUrl for backward compatibility (use the first image)
                    if (product.images.length > 0) {
                      product.imageUrl = product.images[0];
                    }
                    
                    console.log(`Updated images array for product ${productIndex}: ${JSON.stringify(product.images)}`);
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
          console.error('Error parsing products:', e);
          return res.status(400).json({ error: 'Invalid products format' });
        }
      }

      // Handle vitrine data
      if (type === 'vitrine' && vitrine) {
        let parsedVitrine;
        try {
          parsedVitrine = JSON.parse(vitrine);
        } catch (e) {
          console.error('Error parsing vitrine:', e);
          return res.status(400).json({ error: 'Invalid vitrine format' });
        }

        // Handle vitrine images if present
        if (req.files && 'vitrineImages' in req.files) {
          const vitrineImages = req.files['vitrineImages'] as Express.Multer.File[];

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
                
                if (section === 'service' && parsedVitrine.services[parseInt(index)]) {
                  parsedVitrine.services[parseInt(index)].imageUrl = optimizedUrl;
                } else if (section === 'gallery' && parsedVitrine.gallery[parseInt(index)]) {
                  parsedVitrine.gallery[parseInt(index)].imageUrl = optimizedUrl;
                }
              }
            } catch (error) {
              console.error('Error uploading vitrine image to Cloudinary:', error);
            }
          }
        }

        // Set the vitrine data (with or without images)
        qrCodeData.vitrine = parsedVitrine;
      }

      const qrCode = new QRCode();
      qrCode.name = name || 'My QR Code';
      qrCode.type = type || 'url';
      qrCode.links = parsedLinks;
      qrCode.menu = parsedMenu || { restaurantName: '', categories: [] };
      qrCode.products = parsedProducts || { products: [] };
      qrCode.vitrine = qrCodeData.vitrine;
      qrCode.logoUrl = logoUrl;
      qrCode.foregroundColor = foregroundColor || '#6366F1';
      qrCode.backgroundColor = backgroundColor || '#FFFFFF';
      qrCode.textAbove = textAbove || 'Scan me';
      qrCode.textBelow = textBelow || '';
      // Landing page colors
      qrCode.primaryColor = req.body.primaryColor || '#8b5cf6';
      qrCode.primaryHoverColor = req.body.primaryHoverColor || '#7c3aed';
      qrCode.accentColor = req.body.accentColor || '#ec4899';
      qrCode.backgroundGradient = req.body.backgroundGradient || generateDynamicBackground(req.body.primaryColor || '#8b5cf6', req.body.accentColor || '#ec4899');
      qrCode.loadingSpinnerColor = req.body.loadingSpinnerColor || '#8b5cf6';
      qrCode.loadingSpinnerBorderColor = req.body.loadingSpinnerBorderColor || 'rgba(139, 92, 246, 0.2)';
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

        // Set hasVitrine, hasMenu, or hasProducts on user if needed
        if (type === 'vitrine' || type === 'menu' || type === 'products') {
          const user = await userRepository.findOne({ 
            where: { id: req.user.id },
            relations: ['qrCodes']
          });
          if (user) {
            // Count current QR codes by type (excluding the one we're about to create)
            const vitrineCount = user.qrCodes.filter(qr => qr.type === 'vitrine').length;
            const menuCount = user.qrCodes.filter(qr => qr.type === 'menu').length;
            const productsCount = user.qrCodes.filter(qr => qr.type === 'products').length;

            // Set flags to true when creating the first QR code of each type
            if (type === 'vitrine') {
              user.hasVitrine = true;
            }
            if (type === 'menu') {
              user.hasMenu = true;
            }
            if (type === 'products') {
              user.hasProducts = true;
            }
            
            await userRepository.save(user);
          }
        }
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

        // Set hasVitrine, hasMenu, or hasProducts on user if needed
        if (type === 'vitrine' || type === 'menu' || type === 'products') {
          const user = await userRepository.findOne({ 
            where: { id: req.user.id },
            relations: ['qrCodes']
          });
          if (user) {
            // Count current QR codes by type (excluding the one we're about to create)
            const vitrineCount = user.qrCodes.filter(qr => qr.type === 'vitrine').length;
            const menuCount = user.qrCodes.filter(qr => qr.type === 'menu').length;
            const productsCount = user.qrCodes.filter(qr => qr.type === 'products').length;

            // Set flags to true when creating the first QR code of each type
            if (type === 'vitrine') {
              user.hasVitrine = true;
            }
            if (type === 'menu') {
              user.hasMenu = true;
            }
            if (type === 'products') {
              user.hasProducts = true;
            }
            
            await userRepository.save(user);
          }
        }
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

export const getAllQRCodes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;
    const searchTerm = (req.query.searchTerm as string) || '';
    const skip = (page - 1) * limit;

    const where: any = { user: { id: req.user.id } };
    if (searchTerm) {
      where.name = ILike(`%${searchTerm}%`);
    }

    const [qrCodes, total] = await qrCodeRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    res.json({
      data: qrCodes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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
        products: true,
        vitrine: true,
        links: true,
        scanCount: true,
        createdAt: true,
        updatedAt: true,
        // Landing page colors
        primaryColor: true,
        primaryHoverColor: true,
        accentColor: true,
        backgroundGradient: true,
        loadingSpinnerColor: true,
        loadingSpinnerBorderColor: true
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
      const { name, foregroundColor, backgroundColor, links, type, menu, vitrine, url, primaryColor, primaryHoverColor, accentColor, backgroundGradient, loadingSpinnerColor, loadingSpinnerBorderColor } = req.body;
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
      
      // Update landing page colors
      if (primaryColor !== undefined) qrCode.primaryColor = primaryColor;
      if (primaryHoverColor !== undefined) qrCode.primaryHoverColor = primaryHoverColor;
      if (accentColor !== undefined) qrCode.accentColor = accentColor;
      if (backgroundGradient !== undefined) qrCode.backgroundGradient = backgroundGradient;
      if (loadingSpinnerColor !== undefined) qrCode.loadingSpinnerColor = loadingSpinnerColor;
      if (loadingSpinnerBorderColor !== undefined) qrCode.loadingSpinnerBorderColor = loadingSpinnerBorderColor;

      // Handle URL update for landing page redirect
      if (url !== undefined) {
        // For all QR code types, update the URL that redirects to the landing page
        qrCode.url = url;
        // Also update originalUrl for direct type QR codes
        if (qrCode.type === 'direct') {
          qrCode.originalUrl = url;
        }
      }

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
                if (parts.length >= 4) {
                  const categoryIndex = parseInt(parts[1], 10);
                  const itemIndex = parseInt(parts[2], 10);
                  const imageIndex = parseInt(parts[3], 10);
                  
                  if (!isNaN(categoryIndex) && !isNaN(itemIndex) && !isNaN(imageIndex) &&
                      parsedMenu.categories[categoryIndex] && 
                      parsedMenu.categories[categoryIndex].items[itemIndex]) {
                    
                    const menuItem = parsedMenu.categories[categoryIndex].items[itemIndex];
                    
                    // Initialize images array if it doesn't exist
                    if (!menuItem.images) {
                      menuItem.images = [];
                    }
                    
                    // Replace the blob URL at the specific index with the Cloudinary URL
                    if (menuItem.images[imageIndex]) {
                      menuItem.images[imageIndex] = optimizedUrl;
                    } else {
                      // If the index doesn't exist, push to the end
                      menuItem.images.push(optimizedUrl);
                    }
                    
                    // Also update imageUrl for backward compatibility (use the first image)
                    if (menuItem.images.length > 0) {
                      menuItem.imageUrl = menuItem.images[0];
                    }
                    
                    console.log(`Updated images array for category ${categoryIndex}, item ${itemIndex}: ${JSON.stringify(menuItem.images)}`);
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
          
          qrCode.menu = parsedMenu;
        } catch (e) {
          console.error('Error parsing menu:', e);
          return res.status(400).json({ error: 'Invalid menu format' });
        }
      }

      // Handle products
      if (req.body.products !== undefined && type === 'products') {
        try {
          const parsedProducts = typeof req.body.products === 'object' ? req.body.products : JSON.parse(req.body.products);
          
          // Handle product images
          if (req.files && (req.files as any)['productImages']) {
            const productImages = (req.files as any)['productImages'];
            for (let i = 0; i < productImages.length; i++) {
              const imageFile = productImages[i];
              try {
                // Upload image to Cloudinary
                const imageUrl = await uploadToCloudinary(imageFile);
                
                // Get optimized URL for the product image
                const optimizedUrl = getOptimizedUrl(imageUrl, {
                  width: 500,
                  height: 500,
                  crop: 'fill',
                  quality: 'auto'
                });
                
                // Extract product and image indices from the filename
                const filename = imageFile.originalname;
                const parts = filename.split('-');
                if (parts.length >= 3) {
                  const productIndex = parseInt(parts[1], 10);
                  const imageIndex = parseInt(parts[2], 10);
                  
                  if (!isNaN(productIndex) && !isNaN(imageIndex) &&
                      parsedProducts.products[productIndex]) {
                    
                    const product = parsedProducts.products[productIndex];
                    
                    // Initialize images array if it doesn't exist
                    if (!product.images) {
                      product.images = [];
                    }
                    
                    // Replace the blob URL at the specific index with the Cloudinary URL
                    if (product.images[imageIndex]) {
                      product.images[imageIndex] = optimizedUrl;
                    } else {
                      // If the index doesn't exist, push to the end
                      product.images.push(optimizedUrl);
                    }
                    
                    // Also update imageUrl for backward compatibility (use the first image)
                    if (product.images.length > 0) {
                      product.imageUrl = product.images[0];
                    }
                    
                    console.log(`Updated images array for product ${productIndex}: ${JSON.stringify(product.images)}`);
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
          
          qrCode.products = parsedProducts;
        } catch (e) {
          console.error('Error parsing products:', e);
          return res.status(400).json({ error: 'Invalid products format' });
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

    const qrType = qrCode.type;
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

      // After deletion, check if user has any more QRs of this type
      if (qrType === 'vitrine' || qrType === 'menu' || qrType === 'products') {
        const user = await userRepository.findOne({ where: { id: req.user.id }, relations: ['qrCodes'] });
        if (user) {
          if (qrType === 'vitrine') {
            const vitrineCount = user.qrCodes.filter(qr => qr.type === 'vitrine').length;
            if (vitrineCount === 0 && user.hasVitrine) {
              user.hasVitrine = false;
              await userRepository.save(user);
            }
          }
          if (qrType === 'menu') {
            const menuCount = user.qrCodes.filter(qr => qr.type === 'menu').length;
            if (menuCount === 0 && user.hasMenu) {
              user.hasMenu = false;
              await userRepository.save(user);
            }
          }
          if (qrType === 'products') {
            const productsCount = user.qrCodes.filter(qr => qr.type === 'products').length;
            if (productsCount === 0 && user.hasProducts) {
              user.hasProducts = false;
              await userRepository.save(user);
            }
          }
        }
      }
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
      products: qrCode.products,
      vitrine: qrCode.vitrine,
      scanCount: qrCode.scanCount || 0,
      // Landing page colors
      primaryColor: qrCode.primaryColor || '#8b5cf6',
      primaryHoverColor: qrCode.primaryHoverColor || '#7c3aed',
      accentColor: qrCode.accentColor || '#ec4899',
      backgroundGradient: qrCode.backgroundGradient || generateDynamicBackground(qrCode.primaryColor || '#8b5cf6', qrCode.accentColor || '#ec4899'),
      loadingSpinnerColor: qrCode.loadingSpinnerColor || '#8b5cf6',
      loadingSpinnerBorderColor: qrCode.loadingSpinnerBorderColor || 'rgba(139, 92, 246, 0.2)'
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

export const getSitemap = async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://qrcreator.xyz'; // Always use the public domain
    const qrRepo = AppDataSource.getRepository(QRCode);
    const qrCodes = await qrRepo.find({ select: ['id'] });
    const urls = qrCodes.map((qr: { id: string }) =>
      `<url><loc>${baseUrl}/qr/${qr.id}</loc><priority>0.6</priority></url>`
    ).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Failed to generate sitemap');
  }
}; 