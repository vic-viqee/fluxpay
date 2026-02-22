import multer from 'multer';
import path from 'path';

// Define storage settings for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be stored in the 'uploads' directory relative to the project root
    // Ensure this directory exists (it will be created in server.ts)
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter to accept only image files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false); // Pass null as error, and false to reject the file
  }
};

// Initialize Multer upload middleware
const logoUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

// Middleware for a single logo upload
export const uploadLogo = logoUpload.single('logo'); // 'logo' is the field name expected from the frontend
