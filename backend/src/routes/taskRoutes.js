import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/:tripId', createTask);
router.get('/:tripId', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;

