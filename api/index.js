import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Route Imports from backend/routes
import authRoutes from '../backend/routes/authRoutes.js';
import songRoutes from '../backend/routes/songRoutes.js';
import playlistRoutes from '../backend/routes/playlistRoutes.js';
import favoriteRoutes from '../backend/routes/favoriteRoutes.js';
import recommendationRoutes from '../backend/routes/recommendationRoutes.js';
import historyRoutes from '../backend/routes/historyRoutes.js';
import statsRoutes from '../backend/routes/statsRoutes.js';
import adminRoutes from '../backend/routes/adminRoutes.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://melody:MelodyAI2024!@ac-1hzemoe-shard-00-00.yllotgj.mongodb.net:27017/melodyai?ssl=true&authSource=admin&retryWrites=true&w=majority';

// Cached database connection for Vercel Serverless Function execution
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log('Vercel Serverless Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB Atlas Connection Error:', error.message);
  }
};

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB on incoming requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Uploads static asset redirects for seed tracks and cover art
app.use('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  // 1. Cover seeds
  if (filename.startsWith('cover-seed-')) {
    const index = parseInt(filename.split('-').pop()) - 1;
    const coverUrlsList = [
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80',
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80'
    ];
    return res.redirect(coverUrlsList[index % coverUrlsList.length] || coverUrlsList[0]);
  }

  // 2. Song seeds
  if (filename.startsWith('song-seed-')) {
    const index = parseInt(filename.split('-').pop());
    if (!isNaN(index)) {
      return res.redirect(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index}.mp3`);
    }
  }

  // 3. Artist images
  if (filename.startsWith('artist-')) {
    return res.redirect('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80');
  }

  // 4. Album covers
  if (filename.startsWith('album-')) {
    return res.redirect('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80');
  }

  // 5. Default avatar
  if (filename === 'default-avatar.png') {
    return res.redirect('https://api.dicebear.com/7.x/adventurer/svg?seed=melody');
  }

  return res.redirect('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80');
});

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req, res) => {
  const uri = process.env.MONGODB_URI || 'fallback';
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
  res.json({
    status: 'active',
    databaseState: mongoose.connection.readyState,
    uriUsed: maskedUri,
    env: process.env.NODE_ENV
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'MelodyAI Music Player API is running natively on Vercel Serverless!' });
});

export default app;
