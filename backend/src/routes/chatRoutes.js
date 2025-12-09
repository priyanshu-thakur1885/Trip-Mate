import express from 'express';
import { getChatMessages, unsendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/:tripId', getChatMessages);
router.delete('/:tripId/:messageId', unsendMessage);

export default router;

