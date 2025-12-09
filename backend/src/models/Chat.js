import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  voiceUrl: {
    type: String, // Base64 encoded voice data or URL
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;


