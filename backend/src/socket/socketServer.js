import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Trip from '../models/Trip.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Join trip room
    socket.on('join_trip', async (tripId) => {
      try {
        // Verify user has access to this trip
        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        const hasAccess = trip.createdBy.toString() === socket.userId ||
          trip.participants.some(p => p.toString() === socket.userId);

        if (!hasAccess) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(`trip_${tripId}`);
        console.log(`User ${socket.user.name} joined trip ${tripId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave trip room
    socket.on('leave_trip', (tripId) => {
      socket.leave(`trip_${tripId}`);
      console.log(`User ${socket.user.name} left trip ${tripId}`);
    });

    // Handle text message
    socket.on('send_message', async (data) => {
      try {
        const { tripId, message } = data;

        if (!tripId || !message || !message.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Verify user has access
        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        const hasAccess = trip.createdBy.toString() === socket.userId ||
          trip.participants.some(p => p.toString() === socket.userId);

        if (!hasAccess) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Save message to database
        const chatMessage = await Chat.create({
          tripId,
          sender: socket.userId,
          message: message.trim(),
          messageType: 'text'
        });

        // Populate sender info
        await chatMessage.populate('sender', 'name email profilePic');

        // Emit to all users in the trip room
        io.to(`trip_${tripId}`).emit('new_message', {
          _id: chatMessage._id,
          tripId: chatMessage.tripId,
          sender: {
            _id: chatMessage.sender._id,
            name: chatMessage.sender.name,
            email: chatMessage.sender.email,
            profilePic: chatMessage.sender.profilePic
          },
          message: chatMessage.message,
          messageType: chatMessage.messageType,
          createdAt: chatMessage.createdAt
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle voice message
    socket.on('send_voice', async (data) => {
      try {
        const { tripId, voiceData } = data;

        if (!tripId || !voiceData) {
          socket.emit('error', { message: 'Invalid voice data' });
          return;
        }

        // Verify user has access
        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        const hasAccess = trip.createdBy.toString() === socket.userId ||
          trip.participants.some(p => p.toString() === socket.userId);

        if (!hasAccess) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Save voice message to database
        const chatMessage = await Chat.create({
          tripId,
          sender: socket.userId,
          message: 'Voice message',
          messageType: 'voice',
          voiceUrl: voiceData
        });

        // Populate sender info
        await chatMessage.populate('sender', 'name email profilePic');

        // Emit to all users in the trip room
        io.to(`trip_${tripId}`).emit('new_message', {
          _id: chatMessage._id,
          tripId: chatMessage.tripId,
          sender: {
            _id: chatMessage.sender._id,
            name: chatMessage.sender.name,
            email: chatMessage.sender.email,
            profilePic: chatMessage.sender.profilePic
          },
          message: chatMessage.message,
          messageType: chatMessage.messageType,
          voiceUrl: chatMessage.voiceUrl,
          createdAt: chatMessage.createdAt
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle unsend message
    socket.on('unsend_message', async (data) => {
      try {
        const { tripId, messageId } = data;

        if (!tripId || !messageId) {
          socket.emit('error', { message: 'Invalid data' });
          return;
        }

        // Verify trip exists and user has access
        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        const hasAccess = trip.createdBy.toString() === socket.userId ||
          trip.participants.some(p => p.toString() === socket.userId);

        if (!hasAccess) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Find the message
        const message = await Chat.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Verify message belongs to this trip
        if (message.tripId.toString() !== tripId) {
          socket.emit('error', { message: 'Invalid message' });
          return;
        }

        // Only the sender can delete their own message
        if (message.sender.toString() !== socket.userId) {
          socket.emit('error', { message: 'You can only delete your own messages' });
          return;
        }

        // Delete the message
        await message.deleteOne();

        // Notify all users in the trip room that message was deleted
        io.to(`trip_${tripId}`).emit('message_deleted', { messageId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

