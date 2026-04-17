import fs from 'fs';
import os from 'os';
import path from 'path';

let cachedUploadsDir: string | null = null;

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const resolveUploadsDir = () => {
  if (cachedUploadsDir) {
    return cachedUploadsDir;
  }

  const defaultDir = path.resolve(__dirname, '../../uploads');
  try {
    ensureDir(defaultDir);
    cachedUploadsDir = defaultDir;
    return cachedUploadsDir;
  } catch {
    const tempDir = path.join(os.tmpdir(), 'fluxpay-uploads');
    ensureDir(tempDir);
    cachedUploadsDir = tempDir;
    return cachedUploadsDir;
  }
};

export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};