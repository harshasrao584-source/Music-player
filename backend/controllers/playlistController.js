import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';

// @desc    Get current user's playlists
// @route   GET /api/playlists
// @access  Private
export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Private/Public (Public if isPrivate is false)
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs').populate('user', 'username');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is private and does not belong to the user
    if (playlist.isPrivate && (!req.user || playlist.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden: This playlist is private' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  const { name, description, isPrivate } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      user: req.user._id,
      songs: []
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a playlist (Rename/Description/Privacy)
// @route   PUT /api/playlists/:id
// @access  Private
export const updatePlaylist = async (req, res) => {
  const { name, description, isPrivate } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    playlist.name = name !== undefined ? name : playlist.name;
    playlist.description = description !== undefined ? description : playlist.description;
    playlist.isPrivate = isPrivate !== undefined ? isPrivate : playlist.isPrivate;

    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await Playlist.deleteOne({ _id: playlist._id });
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
export const addSongToPlaylist = async (req, res) => {
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this playlist' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if song already exists in playlist to avoid duplicates
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song is already in this playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this playlist' });
    }

    const { songId } = req.params;

    // Filter out the song
    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder playlist songs
// @route   PUT /api/playlists/:id/reorder
// @access  Private
export const reorderPlaylistSongs = async (req, res) => {
  const { songs } = req.body; // Array of song IDs in new order

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this playlist' });
    }

    if (!Array.isArray(songs)) {
      return res.status(400).json({ message: 'Invalid songs format. Must be an array' });
    }

    playlist.songs = songs;
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
