import { Response, Request } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';

const qrCodeRepository = AppDataSource.getRepository(QRCode);

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

    // Get the primary and accent colors
    const primaryColor = qrCode.primaryColor || '#8b5cf6';
    const accentColor = qrCode.accentColor || '#ec4899';
    
    // Generate dynamic background based on user colors
    const dynamicBackground = generateDynamicBackground(primaryColor, accentColor);

    // Return the landing page colors with dynamic background
    const landingPageColors = {
      primaryColor: primaryColor,
      primaryHoverColor: qrCode.primaryHoverColor || '#7c3aed',
      accentColor: accentColor,
      backgroundGradient: qrCode.backgroundGradient || dynamicBackground,
      loadingSpinnerColor: qrCode.loadingSpinnerColor || primaryColor,
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
    if (loadingSpinnerColor !== undefined) qrCode.loadingSpinnerColor = loadingSpinnerColor;
    if (loadingSpinnerBorderColor !== undefined) qrCode.loadingSpinnerBorderColor = loadingSpinnerBorderColor;

    // Auto-generate background gradient if primary or accent colors are updated
    // Only use custom backgroundGradient if explicitly provided
    if (backgroundGradient !== undefined) {
      qrCode.backgroundGradient = backgroundGradient;
    } else if (primaryColor !== undefined || accentColor !== undefined) {
      // Generate new background gradient based on updated colors
      const newPrimaryColor = primaryColor || qrCode.primaryColor || '#8b5cf6';
      const newAccentColor = accentColor || qrCode.accentColor || '#ec4899';
      qrCode.backgroundGradient = generateDynamicBackground(newPrimaryColor, newAccentColor);
    }

    await qrCodeRepository.save(qrCode);

    // Get the updated primary and accent colors
    const updatedPrimaryColor = qrCode.primaryColor || '#8b5cf6';
    const updatedAccentColor = qrCode.accentColor || '#ec4899';
    
    // Generate dynamic background based on updated colors (for response)
    const dynamicBackground = generateDynamicBackground(updatedPrimaryColor, updatedAccentColor);

    // Return the updated colors with dynamic background
    const updatedColors = {
      primaryColor: updatedPrimaryColor,
      primaryHoverColor: qrCode.primaryHoverColor || '#7c3aed',
      accentColor: updatedAccentColor,
      backgroundGradient: qrCode.backgroundGradient || dynamicBackground,
      loadingSpinnerColor: qrCode.loadingSpinnerColor || updatedPrimaryColor,
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