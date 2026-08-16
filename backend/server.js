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
  origin: true,
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

// Fallback middleware if static file is not found (useful for ephemeral environments like Render)
app.use('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  // 1. Cover seeds (cover-seed-1.jpg to cover-seed-10.jpg)
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
    const url = coverUrlsList[index % coverUrlsList.length] || coverUrlsList[0];
    return res.redirect(url);
  }

  // 2. Song seeds (song-seed-1.mp3 to song-seed-16.mp3)
  if (filename.startsWith('song-seed-')) {
    const index = parseInt(filename.split('-').pop());
    if (!isNaN(index)) {
      const url = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index}.mp3`;
      return res.redirect(url);
    }
  }

  // 3. Artist images (e.g. artist-ed-sheeran.jpg)
  if (filename.startsWith('artist-')) {
    return res.redirect('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80');
  }

  // 4. Album covers (e.g. album-divide-&-collab.jpg)
  if (filename.startsWith('album-')) {
    return res.redirect('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80');
  }

  // 5. Default avatar fallback
  if (filename === 'default-avatar.png') {
    return res.redirect('https://api.dicebear.com/7.x/adventurer/svg?seed=melody');
  }

  // 6. Default cover fallback
  if (filename === 'default-cover.png') {
    return res.sendFile(path.join(uploadPath, 'default-cover.png'));
  }

  res.status(404).send('File not found');
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
