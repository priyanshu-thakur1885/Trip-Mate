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

// @desc    Unsend/Delete a message (only sender can delete)
// @route   DELETE /api/chat/:tripId/:messageId
// @access  Private
export const unsendMessage = async (req, res) => {
  try {
    const { tripId, messageId } = req.params;

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

    // Find the message
    const message = await Chat.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify message belongs to this trip
    if (message.tripId.toString() !== tripId) {
      return res.status(400).json({
        success: false,
        message: 'Message does not belong to this trip'
      });
    }

    // Only the sender can delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Delete the message
    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

