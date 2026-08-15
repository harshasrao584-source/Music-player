import Song from '../models/Song.js';
import ListeningHistory from '../models/ListeningHistory.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to check if user token is provided in playback tracking
const getOptionalUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'melodyai_super_secret_session_key_987654321');
      return await User.findById(decoded.id);
    } catch (error) {
      console.error('Optional Auth verification failed:', error.message);
    }
  }
  return null;
};

// @desc    Get all songs (with search, genre/language filter, etc.)
// @route   GET /api/songs
// @access  Public
export const getAllSongs = async (req, res) => {
  const { search, genre, language, limit, page } = req.query;

  try {
    const query = {};

    if (genre) {
      query.genre = { $regex: new RegExp('^' + genre + '$', 'i') };
    }

    if (language) {
      query.language = { $regex: new RegExp('^' + language + '$', 'i') };
    }

    if (search) {
      // Use text search index or regex fallback
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
        { albumName: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { language: { $regex: search, $options: 'i' } }
      ];
    }

    const pageSize = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * pageSize;

    const songs = await Song.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Song.countDocuments(query);

    res.json({
      songs,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get song by ID
// @route   GET /api/songs/:id
// @access  Public
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('artist').populate('album');
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track play count and log to listening history
// @route   POST /api/songs/:id/play
// @access  Public
export const trackPlayback = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Increment play count
    song.playCount += 1;
    await song.save();

    // Check if token exists to log user listening history
    const user = await getOptionalUser(req);
    if (user) {
      await ListeningHistory.create({
        user: user._id,
        song: song._id,
        listenDuration: song.duration // default to full duration
      });
    }

    res.json({ message: 'Playback tracked successfully', playCount: song.playCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique genres
// @route   GET /api/songs/genres
// @access  Public
export const getGenres = async (req, res) => {
  try {
    const genres = await Song.distinct('genre');
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
