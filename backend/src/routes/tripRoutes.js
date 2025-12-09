import express from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addParticipant,
  removeParticipant
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.put('/:id/participants', addParticipant);
router.delete('/:id/participants/:userId', removeParticipant);

export default router;

