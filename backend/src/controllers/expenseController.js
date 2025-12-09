import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';

// @desc    Create expense
// @route   POST /api/expenses/:tripId
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const { tripId } = req.params;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if trip exists and user has access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const expense = await Expense.create({
      tripId,
      title,
      amount,
      category,
      paidBy: req.user._id,
      date: date || new Date()
    });

    // Add expense to trip
    trip.expenses.push(expense._id);
    await trip.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email profilePic');

    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expenses for a trip
// @route   GET /api/expenses/:tripId
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Check if trip exists and user has access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const expenses = await Expense.find({ tripId })
      .populate('paidBy', 'name email profilePic')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is the one who paid or has access to trip
    const trip = await Trip.findById(expense.tripId);
    const hasAccess = expense.paidBy.toString() === req.user._id.toString() ||
      trip.createdBy.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('paidBy', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is the one who paid or has access to trip
    const trip = await Trip.findById(expense.tripId);
    const hasAccess = expense.paidBy.toString() === req.user._id.toString() ||
      trip.createdBy.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Remove from trip
    trip.expenses = trip.expenses.filter(e => e.toString() !== expense._id.toString());
    await trip.save();

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

