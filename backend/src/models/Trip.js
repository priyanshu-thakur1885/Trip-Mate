import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a trip title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  coverImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  itinerary: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary'
  }],
  gallery: [{
    fileData: {
      type: String
    },
    fileName: {
      type: String
    },
    fileType: {
      type: String,
      enum: ['image', 'video']
    },
    mimeType: {
      type: String
    },
    imageUrl: {
      type: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;

