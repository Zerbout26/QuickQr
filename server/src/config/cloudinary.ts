import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { Multer } from 'multer';

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: 'dzersyviu', 
    api_key: '157589271173533', 
    api_secret: '8VVPxTpmdhp3_Kqv22gtQa3YMvw'
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'quickqr',
      resource_type: 'auto',
      format: 'auto',
      quality: 'auto'
    });

    // Return both the URL and public ID
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // Extract the public ID from the URL
    const matches = url.match(/\/v\d+\/([^/]+)\./);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}; 