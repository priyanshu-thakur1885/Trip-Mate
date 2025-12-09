import Invitation from '../models/Invitation.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Accept invitation
// @route   POST /api/invitations/:id/accept
// @access  Private
export const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if user is the invited user
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this invitation'
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}`
      });
    }

    const trip = await Trip.findById(invitation.tripId._id || invitation.tripId);

    // Check if user is already a participant
    const isAlreadyParticipant = trip.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      // Mark invitation as accepted anyway
      invitation.status = 'accepted';
      invitation.respondedAt = new Date();
      await invitation.save();
      
      return res.status(200).json({
        success: true,
        message: 'You are already a participant',
        data: { trip }
      });
    }

    // Add user to trip participants
    trip.participants.push(req.user._id);
    await trip.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Create notification for trip creator
    await Notification.create({
      userId: invitation.invitedBy._id,
      type: 'invitation_accepted',
      title: 'Invitation Accepted',
      message: `${req.user.name} accepted your invitation to join "${trip.title}"`,
      tripId: trip._id,
      invitationId: invitation._id
    });

    const updatedTrip = await Trip.findById(trip._id)
      .populate('createdBy', 'name email profilePic')
      .populate('participants', 'name email profilePic');

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: { trip: updatedTrip }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject invitation
// @route   POST /api/invitations/:id/reject
// @access  Private
export const rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if user is the invited user
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this invitation'
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}`
      });
    }

    const trip = await Trip.findById(invitation.tripId._id || invitation.tripId);

    // Update invitation status
    invitation.status = 'rejected';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Create notification for trip creator
    await Notification.create({
      userId: invitation.invitedBy._id,
      type: 'invitation_rejected',
      title: 'Invitation Rejected',
      message: `${req.user.name} rejected your invitation to join "${trip.title}"`,
      tripId: trip._id,
      invitationId: invitation._id
    });

    res.status(200).json({
      success: true,
      message: 'Invitation rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's invitations
// @route   GET /api/invitations
// @access  Private
export const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user._id,
      status: 'pending'
    })
      .populate('tripId', 'title destination startDate endDate coverImage')
      .populate('invitedBy', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

