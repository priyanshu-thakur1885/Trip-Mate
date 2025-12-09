import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Travel', 'Food', 'Stay', 'Shopping', 'Activities', 'Misc'],
    default: 'Misc'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;

