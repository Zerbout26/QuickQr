import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const qrCodeRepository = AppDataSource.getRepository(QRCode);

// Get landing page colors for a specific QR code
export const getLandingPageColors = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'QR code ID is required' });
    }

    const qrCode = await qrCodeRepository.findOne({
      select: {
        id: true,
        primaryColor: true,
        primaryHoverColor: true,
        accentColor: true,
        backgroundGradient: true,
        loadingSpinnerColor: true,
        loadingSpinnerBorderColor: true
      },
      where: { id }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Return the landing page colors with defaults
    const landingPageColors = {
      primaryColor: qrCode.primaryColor || '#8b5cf6',
      primaryHoverColor: qrCode.primaryHoverColor || '#7c3aed',
      accentColor: qrCode.accentColor || '#ec4899',
      backgroundGradient: qrCode.backgroundGradient || 'linear-gradient(to bottom right, #8b5cf620, white, #ec489920)',
      loadingSpinnerColor: qrCode.loadingSpinnerColor || '#8b5cf6',
      loadingSpinnerBorderColor: qrCode.loadingSpinnerBorderColor || 'rgba(139, 92, 246, 0.2)'
    };

    res.json(landingPageColors);
  } catch (error) {
    console.error('Error fetching landing page colors:', error);
    res.status(500).json({ error: 'Error fetching landing page colors' });
  }
};

// Update landing page colors for a specific QR code
export const updateLandingPageColors = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      primaryColor, 
      primaryHoverColor, 
      accentColor, 
      backgroundGradient, 
      loadingSpinnerColor, 
      loadingSpinnerBorderColor 
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'QR code ID is required' });
    }

    const qrCode = await qrCodeRepository.findOne({
      where: { id }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Update only the color fields that are provided
    if (primaryColor !== undefined) qrCode.primaryColor = primaryColor;
    if (primaryHoverColor !== undefined) qrCode.primaryHoverColor = primaryHoverColor;
    if (accentColor !== undefined) qrCode.accentColor = accentColor;
    if (backgroundGradient !== undefined) qrCode.backgroundGradient = backgroundGradient;
    if (loadingSpinnerColor !== undefined) qrCode.loadingSpinnerColor = loadingSpinnerColor;
    if (loadingSpinnerBorderColor !== undefined) qrCode.loadingSpinnerBorderColor = loadingSpinnerBorderColor;

    await qrCodeRepository.save(qrCode);

    // Return the updated colors
    const updatedColors = {
      primaryColor: qrCode.primaryColor || '#8b5cf6',
      primaryHoverColor: qrCode.primaryHoverColor || '#7c3aed',
      accentColor: qrCode.accentColor || '#ec4899',
      backgroundGradient: qrCode.backgroundGradient || 'linear-gradient(to bottom right, #8b5cf620, white, #ec489920)',
      loadingSpinnerColor: qrCode.loadingSpinnerColor || '#8b5cf6',
      loadingSpinnerBorderColor: qrCode.loadingSpinnerBorderColor || 'rgba(139, 92, 246, 0.2)'
    };

    res.json({ 
      message: 'Landing page colors updated successfully',
      colors: updatedColors 
    });
  } catch (error) {
    console.error('Error updating landing page colors:', error);
    res.status(500).json({ error: 'Error updating landing page colors' });
  }
}; 