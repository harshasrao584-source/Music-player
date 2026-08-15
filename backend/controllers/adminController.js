import fs from 'fs';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import User from '../models/User.js';
import Playlist from '../models/Playlist.js';
import Favorite from '../models/Favorite.js';

// Helper to delete local media files on track deletion
const deleteLocalFile = (filePath) => {
  if (!filePath) return;
  // If path starts with /uploads/ or uploads/, standardise it to local path
  const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  if (fs.existsSync(normalizedPath)) {
    try {
      fs.unlinkSync(normalizedPath);
      console.log(`Deleted local file: ${normalizedPath}`);
    } catch (err) {
      console.error(`Error deleting file ${normalizedPath}:`, err.message);
    }
  }
};

// @desc    Add a new song with audio & cover artwork uploads
// @route   POST /api/admin/songs
// @access  Private/Admin
export const addSong = async (req, res) => {
  const { title, artistName, albumName, genre, duration, releaseYear } = req.body;

  try {
    if (!title || !artistName || !genre || !duration) {
      return res.status(400).json({ message: 'Title, artistName, genre, and duration are required' });
    }

    if (!req.files || !req.files['audio']) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files['audio'][0];
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    // 1. Resolve or create Artist
    const cleanArtistName = artistName.trim();
    let artist = await Artist.findOne({ name: { $regex: new RegExp('^' + cleanArtistName + '$', 'i') } });
    if (!artist) {
      artist = await Artist.create({
        name: cleanArtistName,
        bio: `${cleanArtistName} is a MelodyAI featured artist.`,
        imageUrl: coverFile ? `/uploads/${coverFile.filename}` : ''
      });
    }

    // 2. Resolve or create Album if name is provided
    let album = null;
    const cleanAlbumName = albumName ? albumName.trim() : '';
    if (cleanAlbumName) {
      album = await Album.findOne({
        title: { $regex: new RegExp('^' + cleanAlbumName + '$', 'i') },
        artist: artist._id
      });
      if (!album) {
        album = await Album.create({
          title: cleanAlbumName,
          artist: artist._id,
          coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '',
          releaseYear: parseInt(releaseYear) || new Date().getFullYear()
        });
      }
    }

    // 3. Create Song
    const song = await Song.create({
      title: title.trim(),
      artist: artist._id,
      artistName: artist.name,
      album: album ? album._id : null,
      albumName: album ? album.title : '',
      genre: genre.trim(),
      language: (req.body.language || 'English').trim(),
      duration: parseFloat(duration),
      audioUrl: `/uploads/${audioFile.filename}`,
      coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '/uploads/default-cover.png'
    });

    res.status(201).json(song);
  } catch (error) {
    // Delete uploaded files if creation failed to avoid orphans
    if (req.files) {
      if (req.files['audio']) deleteLocalFile(req.files['audio'][0].path);
      if (req.files['cover']) deleteLocalFile(req.files['cover'][0].path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a song's details or files
// @route   PUT /api/admin/songs/:id
// @access  Private/Admin
export const editSong = async (req, res) => {
  const { title, artistName, albumName, genre, duration } = req.body;

  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Update files if provided
    if (req.files) {
      if (req.files['audio']) {
        deleteLocalFile(song.audioUrl);
        song.audioUrl = `/uploads/${req.files['audio'][0].filename}`;
      }
      if (req.files['cover']) {
        if (song.coverUrl && song.coverUrl !== '/uploads/default-cover.png') {
          deleteLocalFile(song.coverUrl);
        }
        song.coverUrl = `/uploads/${req.files['cover'][0].filename}`;
      }
    }

    if (title) song.title = title.trim();
    if (genre) song.genre = genre.trim();
    if (req.body.language) song.language = req.body.language.trim();
    if (duration) song.duration = parseFloat(duration);

    // If artist changes, resolve or create the new one
    if (artistName && artistName.trim() !== song.artistName) {
      const cleanArtistName = artistName.trim();
      let artist = await Artist.findOne({ name: { $regex: new RegExp('^' + cleanArtistName + '$', 'i') } });
      if (!artist) {
        artist = await Artist.create({
          name: cleanArtistName,
          bio: `${cleanArtistName} is a MelodyAI featured artist.`
        });
      }
      song.artist = artist._id;
      song.artistName = artist.name;
    }

    // If album changes, resolve or create the new one
    if (albumName !== undefined) {
      const cleanAlbumName = albumName.trim();
      if (cleanAlbumName) {
        let album = await Album.findOne({
          title: { $regex: new RegExp('^' + cleanAlbumName + '$', 'i') },
          artist: song.artist
        });
        if (!album) {
          album = await Album.create({
            title: cleanAlbumName,
            artist: song.artist,
            coverUrl: song.coverUrl
          });
        }
        song.album = album._id;
        song.albumName = album.title;
      } else {
        song.album = null;
        song.albumName = '';
      }
    }

    const updatedSong = await song.save();
    res.json(updatedSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a song and its local files
// @route   DELETE /api/admin/songs/:id
// @access  Private/Admin
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete local media files
    deleteLocalFile(song.audioUrl);
    if (song.coverUrl && song.coverUrl !== '/uploads/default-cover.png') {
      deleteLocalFile(song.coverUrl);
    }

    // Remove song from playlists
    await Playlist.updateMany(
      { songs: song._id },
      { $pull: { songs: song._id } }
    );

    // Remove song from favorites
    await Favorite.deleteMany({ song: song._id });

    // Delete Song document
    await Song.deleteOne({ _id: song._id });

    res.json({ message: 'Song and associated files deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete themselves' });
    }

    // Delete user's playlists & favorites
    await Playlist.deleteMany({ user: user._id });
    await Favorite.deleteMany({ user: user._id });

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global application stats for dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSongs = await Song.countDocuments({});
    const totalPlaylists = await Playlist.countDocuments({});

    // Sum of all play counts
    const songs = await Song.find({});
    const totalPlays = songs.reduce((sum, s) => sum + (s.playCount || 0), 0);

    // Get top playing song
    const topSong = await Song.findOne({}).sort({ playCount: -1 });

    res.json({
      totalUsers,
      totalSongs,
      totalPlaylists,
      totalPlays,
      topSongName: topSong ? `${topSong.title} (by ${topSong.artistName})` : 'N/A'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
