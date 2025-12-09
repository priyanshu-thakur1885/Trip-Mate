import Chat from '../models/Chat.js';
import Trip from '../models/Trip.js';

// @desc    Get chat messages for a trip
// @route   GET /api/chat/:tripId
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip exists and user has access
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

    // Get messages
    const messages = await Chat.find({ tripId })
      .populate('sender', 'name email profilePic')
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

