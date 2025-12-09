import Trip from '../models/Trip.js';

// @desc    Add photo to gallery
// @route   POST /api/gallery/:tripId
// @access  Private
export const addPhoto = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const { tripId } = req.params;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL'
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

    trip.gallery.push({
      imageUrl,
      uploadedBy: req.user._id
    });

    await trip.save();

    res.status(201).json({
      success: true,
      data: trip.gallery[trip.gallery.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete photo from gallery
// @route   DELETE /api/gallery/:tripId/:photoId
// @access  Private
export const deletePhoto = async (req, res) => {
  try {
    const { tripId, photoId } = req.params;

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

    trip.gallery = trip.gallery.filter(
      photo => photo._id.toString() !== photoId
    );

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

