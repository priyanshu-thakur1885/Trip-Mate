import express from 'express';
import multer from 'multer';
import {
  addPhoto,
  deletePhoto
} from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// File filter to accept images and videos including HEIC, MOV, JPG, PNG
const fileFilter = (req, file, cb) => {
  // Check by MIME type
  const isValidMimeType = 
    file.mimetype.startsWith('image/') || 
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'image/heic' ||
    file.mimetype === 'image/heif' ||
    file.mimetype === 'video/quicktime';

  // Check by file extension (for cases where MIME type might not be recognized)
  const fileExtension = file.originalname.toLowerCase().split('.').pop();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'mov', 'mp4', 'avi', 'mkv', 'webm'];
  const isValidExtension = validExtensions.includes(fileExtension);

  if (isValidMimeType || isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed (JPG, PNG, HEIC, MOV, MP4, etc.)'), false);
  }
};

// Use memory storage since we convert to base64 immediately
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

router.post('/:tripId', upload.single('file'), addPhoto);
router.delete('/:tripId/:photoId', deletePhoto);

export default router;

