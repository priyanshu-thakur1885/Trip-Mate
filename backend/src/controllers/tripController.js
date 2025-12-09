import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';
import Itinerary from '../models/Itinerary.js';
import Task from '../models/Task.js';

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, coverImage, description, budget } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      coverImage: coverImage || '',
      description: description || '',
      budget: budget || 0,
      createdBy: req.user._id,
      participants: [req.user._id]
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
  try {
    const { filter, search } = req.query;
    let query = {};

    // Filter by user participation
    query.$or = [
      { createdBy: req.user._id },
      { participants: req.user._id }
    ];

    // Search filter
    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    let trips = await Trip.find(query)
      .populate('createdBy', 'name email profilePic')
      .populate('participants', 'name email profilePic')
      .sort({ createdAt: -1 });

    // Apply date filters
    if (filter === 'upcoming') {
      trips = trips.filter(trip => new Date(trip.startDate) > new Date());
    } else if (filter === 'past') {
      trips = trips.filter(trip => new Date(trip.endDate) < new Date());
    } else if (filter === 'ongoing') {
      const now = new Date();
      trips = trips.filter(trip => 
        new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
      );
    }

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('createdBy', 'name email profilePic')
      .populate('participants', 'name email profilePic');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user has access
    const hasAccess = trip.createdBy._id.toString() === req.user._id.toString() ||
      trip.participants.some(p => p._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this trip'
      });
    }

    // Populate expenses, itinerary, tasks
    const expenses = await Expense.find({ tripId: trip._id })
      .populate('paidBy', 'name email profilePic');
    const itinerary = await Itinerary.find({ tripId: trip._id }).sort({ day: 1, time: 1 });
    const tasks = await Task.find({ tripId: trip._id })
      .populate('assignedTo', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: {
        ...trip.toObject(),
        expenses,
        itinerary,
        tasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is creator
    if (trip.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email profilePic')
     .populate('participants', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is creator
    if (trip.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip'
      });
    }

    // Delete related expenses, itinerary, tasks
    await Expense.deleteMany({ tripId: trip._id });
    await Itinerary.deleteMany({ tripId: trip._id });
    await Task.deleteMany({ tripId: trip._id });

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add participant
// @route   PUT /api/trips/:id/participants
// @access  Private
export const addParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is creator or participant
    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!trip.participants.includes(userId)) {
      trip.participants.push(userId);
      await trip.save();
    }

    const updatedTrip = await Trip.findById(req.params.id)
      .populate('createdBy', 'name email profilePic')
      .populate('participants', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove participant
// @route   DELETE /api/trips/:id/participants/:userId
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is creator
    if (trip.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    trip.participants = trip.participants.filter(
      p => p.toString() !== req.params.userId
    );
    await trip.save();

    const updatedTrip = await Trip.findById(req.params.id)
      .populate('createdBy', 'name email profilePic')
      .populate('participants', 'name email profilePic');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

