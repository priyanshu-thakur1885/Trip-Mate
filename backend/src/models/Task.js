import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  task: {
    type: String,
    required: [true, 'Please provide a task'],
    trim: true,
    maxlength: [200, 'Task cannot be more than 200 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'complete'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

