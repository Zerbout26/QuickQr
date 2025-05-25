import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzersyviu',
    api_key: process.env.CLOUDINARY_API_KEY || '157589271173533',
    api_secret: process.env.CLOUDINARY_API_SECRET || '8VVPxTpmdhp3_Kqv22gtQa3YMvw'
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'quickqr',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

// Create multer upload instance
export const upload = multer({ storage: storage });

// Helper function to upload a file to Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'quickqr',
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

// Helper function to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Helper function to get optimized URL
export const getOptimizedUrl = (url: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
} = {}): string => {
    const defaultOptions = {
        fetch_format: 'auto',
        quality: 'auto',
        ...options
    };
    
    return cloudinary.url(url, defaultOptions);
}; 