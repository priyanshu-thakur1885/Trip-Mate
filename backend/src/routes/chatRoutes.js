import express from 'express';
import { getChatMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/:tripId', getChatMessages);

export default router;

