import Trip from '../models/Trip.js';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

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

    // Determine file type
    const mimeType = req.file.mimetype;
    const fileType = mimeType.startsWith('image/') ? 'image' : 
                     mimeType.startsWith('video/') ? 'video' : 'image';
    
    const fileSize = req.file.buffer.length;
    const FILE_SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB - use GridFS for files larger than 5MB

    let fileData = null;
    let gridfsFileId = null;

    if (fileSize > FILE_SIZE_THRESHOLD) {
      // Use GridFS for large files
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'gallery'
      });

      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: mimeType,
        metadata: {
          tripId: tripId,
          uploadedBy: req.user._id.toString()
        }
      });

      uploadStream.end(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          gridfsFileId = uploadStream.id;
          resolve();
        });
        uploadStream.on('error', reject);
      });
    } else {
      // Use base64 for small files (backward compatible)
      fileData = req.file.buffer.toString('base64');
    }

    // Add to gallery
    const galleryItem = {
      fileName: req.file.originalname,
      fileType: fileType,
      mimeType: mimeType,
      uploadedBy: req.user._id
    };

    if (fileData) {
      galleryItem.fileData = fileData;
    } else if (gridfsFileId) {
      galleryItem.gridfsFileId = gridfsFileId;
    }

    trip.gallery.push(galleryItem);
    await trip.save();

    const newPhoto = trip.gallery[trip.gallery.length - 1];
    
    // Return file data or URL
    const responseData = {
      _id: newPhoto._id,
      fileName: newPhoto.fileName,
      fileType: newPhoto.fileType,
      mimeType: newPhoto.mimeType,
      uploadedAt: newPhoto.uploadedAt,
      uploadedBy: newPhoto.uploadedBy
    };

    if (fileData) {
      responseData.fileData = `data:${mimeType};base64,${fileData}`;
    } else if (gridfsFileId) {
      const baseUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:5000';
      responseData.fileData = `${baseUrl}/api/gallery/file/${gridfsFileId}`;
    }
    
    res.status(201).json({
      success: true,
      data: responseData
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

    // Find the photo to delete
    const photo = trip.gallery.find(p => p._id.toString() === photoId);
    
    // Delete from GridFS if it exists
    if (photo && photo.gridfsFileId) {
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'gallery'
      });
      
      try {
        await bucket.delete(photo.gridfsFileId);
      } catch (error) {
        console.error('Error deleting GridFS file:', error);
        // Continue with deletion even if GridFS delete fails
      }
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

// @desc    Get file from GridFS
// @route   GET /api/gallery/file/:fileId
// @access  Private
export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'gallery'
    });

    const fileIdObj = new mongoose.Types.ObjectId(fileId);
    const downloadStream = bucket.openDownloadStream(fileIdObj);

    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.contentType || 'application/octet-stream');
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    });

    downloadStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

