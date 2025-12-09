import Task from '../models/Task.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Create task
// @route   POST /api/tasks/:tripId
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { task, assignedTo } = req.body;
    const { tripId } = req.params;

    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task'
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

    const newTask = await Task.create({
      tripId,
      task,
      assignedTo: assignedTo || null,
      status: 'pending'
    });

    // Add to trip
    trip.tasks.push(newTask._id);
    await trip.save();

    // If task is assigned to someone, send notification
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        await Notification.create({
          userId: assignedTo,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `${req.user.name} assigned you a task: "${task}" for trip "${trip.title}"`,
          tripId: trip._id,
          taskId: newTask._id
        });
      }
    }

    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email profilePic');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tasks for a trip
// @route   GET /api/tasks/:tripId
// @access  Private
export const getTasks = async (req, res) => {
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

    const tasks = await Task.find({ tripId })
      .populate('assignedTo', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to trip
    const trip = await Trip.findById(task.tripId);
    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // If trying to change status from pending to complete, only assigned user can do it
    if (req.body.status === 'complete' && task.status === 'pending') {
      if (!task.assignedTo) {
        return res.status(400).json({
          success: false,
          message: 'Task must be assigned to someone before marking as complete'
        });
      }

      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned person can mark this task as complete'
        });
      }
    }

    // Handle assignment changes - send notification if assigned to someone new
    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
    const newAssignedTo = req.body.assignedTo ? req.body.assignedTo.toString() : null;

    // If task is being assigned to someone new (and different from current user)
    if (newAssignedTo && newAssignedTo !== oldAssignedTo && newAssignedTo !== req.user._id.toString()) {
      const assignedUser = await User.findById(newAssignedTo);
      if (assignedUser) {
        await Notification.create({
          userId: newAssignedTo,
          type: 'task_assigned',
          title: 'Task Assigned to You',
          message: `${req.user.name} assigned you a task: "${req.body.task || task.task}" for trip "${trip.title}"`,
          tripId: trip._id,
          taskId: task._id
        });
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to trip
    const trip = await Trip.findById(task.tripId);
    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Remove from trip
    trip.tasks = trip.tasks.filter(t => t.toString() !== task._id.toString());
    await trip.save();

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

