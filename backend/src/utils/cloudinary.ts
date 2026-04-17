import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fluxpay',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  } as any,
});

export const uploadToCloudinary = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop()?.toLowerCase() || '');
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
  },
});

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  });
};

export default cloudinary;