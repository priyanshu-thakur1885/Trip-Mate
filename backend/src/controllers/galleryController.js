import Trip from '../models/Trip.js';

// @desc    Add photo/video to gallery
// @route   POST /api/gallery/:tripId
// @access  Private
export const addPhoto = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file'
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

    // Convert buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    
    // Determine file type
    const mimeType = req.file.mimetype;
    const fileType = mimeType.startsWith('image/') ? 'image' : 
                     mimeType.startsWith('video/') ? 'video' : 'image';

    // Add to gallery
    trip.gallery.push({
      fileData: base64Data,
      fileName: req.file.originalname,
      fileType: fileType,
      mimeType: mimeType,
      uploadedBy: req.user._id
    });

    await trip.save();

    const newPhoto = trip.gallery[trip.gallery.length - 1];
    
    // Return file data with data URL for frontend
    res.status(201).json({
      success: true,
      data: {
        _id: newPhoto._id,
        fileData: `data:${mimeType};base64,${base64Data}`,
        fileName: newPhoto.fileName,
        fileType: newPhoto.fileType,
        mimeType: newPhoto.mimeType,
        uploadedAt: newPhoto.uploadedAt,
        uploadedBy: newPhoto.uploadedBy
      }
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

