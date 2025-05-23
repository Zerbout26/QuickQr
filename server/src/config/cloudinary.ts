import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using the URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL || 'cloudinary://662334265464293:aTVyBOf1HcAwCFSaY3KLUEz_KTQ@dzersyviu'
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

    return result.secure_url;
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