import express from 'express';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/:tripId', createExpense);
router.get('/:tripId', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;

