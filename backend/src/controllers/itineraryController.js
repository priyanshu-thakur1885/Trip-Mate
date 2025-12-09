import Itinerary from '../models/Itinerary.js';
import Trip from '../models/Trip.js';

// @desc    Create itinerary item
// @route   POST /api/itinerary/:tripId
// @access  Private
export const createItinerary = async (req, res) => {
  try {
    const { day, activity, time, notes } = req.body;
    const { tripId } = req.params;

    if (!day || !activity || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide day, activity, and time'
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

    const itinerary = await Itinerary.create({
      tripId,
      day,
      activity,
      time,
      notes: notes || ''
    });

    // Add to trip
    trip.itinerary.push(itinerary._id);
    await trip.save();

    res.status(201).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get itinerary for a trip
// @route   GET /api/itinerary/:tripId
// @access  Private
export const getItinerary = async (req, res) => {
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

    const itinerary = await Itinerary.find({ tripId }).sort({ day: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: itinerary.length,
      data: itinerary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update itinerary item
// @route   PUT /api/itinerary/:id
// @access  Private
export const updateItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary item not found'
      });
    }

    // Check if user has access to trip
    const trip = await Trip.findById(itinerary.tripId);
    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete itinerary item
// @route   DELETE /api/itinerary/:id
// @access  Private
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary item not found'
      });
    }

    // Check if user has access to trip
    const trip = await Trip.findById(itinerary.tripId);
    const hasAccess = trip.createdBy.toString() === req.user._id.toString() ||
      trip.participants.some(p => p.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Remove from trip
    trip.itinerary = trip.itinerary.filter(i => i.toString() !== itinerary._id.toString());
    await trip.save();

    await itinerary.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Itinerary item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

