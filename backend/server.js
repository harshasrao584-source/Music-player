import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load Env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder and standard assets exist
const uploadPath = path.resolve('uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Create a dummy cover art file if not already present
const defaultCoverPath = path.join(uploadPath, 'default-cover.png');
if (!fs.existsSync(defaultCoverPath)) {
  // Create a minimal 1x1 transparent PNG or write dummy text to file
  // Here we write a small solid placeholder image or blank buffer.
  const dummyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(defaultCoverPath, dummyPng);
}

// Static folder routing for file requests
app.use('/uploads', express.static(uploadPath));

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('MelodyAI Music Player API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
