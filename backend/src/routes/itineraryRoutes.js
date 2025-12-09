import express from 'express';
import {
  createItinerary,
  getItinerary,
  updateItinerary,
  deleteItinerary
} from '../controllers/itineraryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/:tripId', createItinerary);
router.get('/:tripId', getItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

export default router;

