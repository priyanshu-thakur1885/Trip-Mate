import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  day: {
    type: Number,
    required: [true, 'Please provide a day number'],
    min: [1, 'Day must be at least 1']
  },
  activity: {
    type: String,
    required: [true, 'Please provide an activity'],
    trim: true,
    maxlength: [200, 'Activity cannot be more than 200 characters']
  },
  time: {
    type: String,
    required: [true, 'Please provide a time'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;

