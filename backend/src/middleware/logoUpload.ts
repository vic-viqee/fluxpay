import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { resolveUploadsDir, isCloudinaryConfigured } from '../utils/uploads';
import { uploadToCloudinary } from '../utils/cloudinary';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolveUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const localUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export const uploadLogo = (req: Request, res: Response, next: NextFunction) => {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary.single('logo')(req as any, res, next);
  }
  return localUpload.single('logo')(req, res, next);
};