import express from 'express';
import {
  acceptInvitation,
  rejectInvitation,
  getInvitations
} from '../controllers/invitationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getInvitations);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);

export default router;


