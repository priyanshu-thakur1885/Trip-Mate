import express from 'express';
import {
  addPhoto,
  deletePhoto
} from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/:tripId', addPhoto);
router.delete('/:tripId/:photoId', deletePhoto);

export default router;

