const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { IMAGE_MAX_WIDTH, IMAGE_QUALITY } = require('../config/constants');
const logger = require('../utils/logger');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Memory storage for multer: processes file entirely in buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

/**
 * Process image buffer with Sharp and save optimized WebP image.
 * @param {Buffer} buffer - Raw image file buffer
 * @returns {Promise<string>} Relative URL path e.g. '/uploads/1711200000-abc123.webp'
 */
async function processAndSave(buffer) {
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
  const targetPath = path.join(UPLOADS_DIR, filename);

  await sharp(buffer)
    .resize({
      width: IMAGE_MAX_WIDTH || 800,
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_QUALITY || 80 })
    .toFile(targetPath);

  logger.info(`[ImageService] Saved optimized image: ${filename}`);
  return `/uploads/${filename}`;
}

module.exports = {
  upload,
  processAndSave,
};
