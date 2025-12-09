import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';
import Itinerary from '../models/Itinerary.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import Notification from '../models/Notification.js';

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

    // Transform gallery items to include data URLs or GridFS URLs
    const tripData = trip.toObject();
    if (tripData.gallery && tripData.gallery.length > 0) {
      tripData.gallery = tripData.gallery.map(photo => {
        // If GridFS file ID exists, create URL
        if (photo.gridfsFileId) {
          const baseUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:5000';
          return {
            ...photo,
            fileData: `${baseUrl}/api/gallery/file/${photo.gridfsFileId}`
          };
        }
        // If fileData exists and is not already a data URL, convert it
        if (photo.fileData && !photo.fileData.startsWith('data:') && !photo.fileData.startsWith('http')) {
          return {
            ...photo,
            fileData: `data:${photo.mimeType || 'image/jpeg'};base64,${photo.fileData}`
          };
        }
        // Fallback for old imageUrl format
        if (photo.imageUrl && !photo.fileData && !photo.gridfsFileId) {
          return {
            ...photo,
            fileData: photo.imageUrl,
            fileType: 'image',
            mimeType: 'image/jpeg'
          };
        }
        return photo;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...tripData,
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

// @desc    Invite participant (only trip creator can invite)
// @route   PUT /api/trips/:id/participants
// @access  Private
export const inviteParticipant = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Only trip creator can invite participants
    if (trip.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only trip creator can invite participants'
      });
    }

    // Find user by email
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = trip.participants.some(
      p => p.toString() === invitedUser._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      tripId: trip._id,
      invitedUser: invitedUser._id,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this user'
      });
    }

    // Create invitation
    const invitation = await Invitation.create({
      tripId: trip._id,
      invitedBy: req.user._id,
      invitedUser: invitedUser._id,
      status: 'pending'
    });

    // Create notification for invited user
    await Notification.create({
      userId: invitedUser._id,
      type: 'trip_invitation',
      title: 'Trip Invitation',
      message: `${req.user.name} invited you to join the trip "${trip.title}"`,
      tripId: trip._id,
      invitationId: invitation._id
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitation: {
          _id: invitation._id,
          tripId: trip._id,
          invitedUser: {
            _id: invitedUser._id,
            name: invitedUser.name,
            email: invitedUser.email
          },
          status: invitation.status
        }
      }
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove participant (creator can remove anyone, participant can only remove themselves)
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

    const isCreator = trip.createdBy.toString() === req.user._id.toString();
    const isRemovingSelf = req.params.userId === req.user._id.toString();

    // Only creator can remove others, or user can remove themselves
    if (!isCreator && !isRemovingSelf) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this participant'
      });
    }

    // Creator cannot remove themselves
    if (isCreator && isRemovingSelf) {
      return res.status(400).json({
        success: false,
        message: 'Trip creator cannot leave the trip. Delete the trip instead.'
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
      message: isRemovingSelf ? 'You have left the trip' : 'Participant removed',
      data: updatedTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Leave trip (participant leaves themselves)
// @route   POST /api/trips/:id/leave
// @access  Private
export const leaveTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is creator
    if (trip.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Trip creator cannot leave the trip. Delete the trip instead.'
      });
    }

    // Check if user is a participant
    const isParticipant = trip.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant of this trip'
      });
    }

    // Remove user from participants
    trip.participants = trip.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'You have left the trip'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

