import express from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  inviteParticipant,
  removeParticipant,
  leaveTrip
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.put('/:id/participants', inviteParticipant);
router.post('/:id/leave', leaveTrip);
router.delete('/:id/participants/:userId', removeParticipant);

export default router;

