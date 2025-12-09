import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middleware/errorMiddleware.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import tripRoutes from './src/routes/tripRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import itineraryRoutes from './src/routes/itineraryRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import galleryRoutes from './src/routes/galleryRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-app')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

