import Favorite from '../models/Favorite.js';
import Song from '../models/Song.js';

// @desc    Get user's favorite songs
// @route   GET /api/favorites
// @access  Private
export const getFavoriteSongs = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('song')
      .sort({ createdAt: -1 });
    
    // Extract song documents from favorites list
    const songs = favorites.map(fav => fav.song).filter(song => song !== null);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like status on a song
// @route   POST /api/favorites/toggle/:songId
// @access  Private
export const toggleFavoriteSong = async (req, res) => {
  const { songId } = req.params;

  try {
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const existingFav = await Favorite.findOne({ user: req.user._id, song: songId });

    if (existingFav) {
      // Unlike
      await Favorite.deleteOne({ _id: existingFav._id });
      // Update like count on the song
      song.likeCount = Math.max(0, song.likeCount - 1);
      await song.save();
      return res.json({ liked: false, likeCount: song.likeCount });
    } else {
      // Like
      await Favorite.create({ user: req.user._id, song: songId });
      song.likeCount += 1;
      await song.save();
      return res.json({ liked: true, likeCount: song.likeCount });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user liked a song
// @route   GET /api/favorites/status/:songId
// @access  Private
export const checkFavoriteStatus = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id, song: req.params.songId });
    res.json({ liked: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
