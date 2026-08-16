import Song from '../models/Song.js';
import Favorite from '../models/Favorite.js';
import ListeningHistory from '../models/ListeningHistory.js';

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations/personalized
// @access  Private
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's favorites and history
    const favorites = await Favorite.find({ user: userId }).populate('song');
    const history = await ListeningHistory.find({ user: userId })
      .populate('song')
      .sort({ playedAt: -1 })
      .limit(30);

    const likedSongs = favorites.map(f => f.song).filter(Boolean);
    const playedSongs = history.map(h => h.song).filter(Boolean);

    // If user has no favorites and no history, return trending/top-played songs as fallback
    if (likedSongs.length === 0 && playedSongs.length === 0) {
      const trendingSongs = await Song.find({})
        .sort({ playCount: -1, likeCount: -1 })
        .limit(10);
      return res.json({
        type: 'Trending (No history)',
        songs: trendingSongs
      });
    }

    // 2. Count genre and artist preferences
    const genreScores = {};
    const artistScores = {};

    const analyzeSongs = (songs, weight) => {
      songs.forEach(song => {
        if (song.genre) {
          genreScores[song.genre] = (genreScores[song.genre] || 0) + weight;
        }
        if (song.artist) {
          const artistId = song.artist.toString();
          artistScores[artistId] = (artistScores[artistId] || 0) + weight;
        }
      });
    };

    // Weight liked songs higher (3x) than recently played songs (1x)
    analyzeSongs(likedSongs, 3);
    analyzeSongs(playedSongs, 1);

    // Get top genres & artists
    const topGenres = Object.keys(genreScores).sort((a, b) => genreScores[b] - genreScores[a]).slice(0, 3);
    const topArtists = Object.keys(artistScores).sort((a, b) => artistScores[b] - artistScores[a]).slice(0, 2);

    // 3. Find songs in top genres or by top artists
    // Exclude songs the user has already liked or played very recently (e.g. last 5)
    const recentlyPlayedIds = playedSongs.slice(0, 5).map(s => s._id.toString());
    const likedIds = likedSongs.map(s => s._id.toString());
    const excludeIds = [...new Set([...recentlyPlayedIds, ...likedIds])];

    const recommendedSongs = await Song.find({
      _id: { $nin: excludeIds },
      $or: [
        { genre: { $in: topGenres } },
        { artist: { $in: topArtists } }
      ]
    })
      .sort({ playCount: -1, likeCount: -1 })
      .limit(12);

    // Fallback if recommendations list is too short: append trending songs
    if (recommendedSongs.length < 6) {
      const additionalSongs = await Song.find({
        _id: { $nin: [...excludeIds, ...recommendedSongs.map(s => s._id.toString())] }
      })
        .sort({ playCount: -1 })
        .limit(10 - recommendedSongs.length);
      recommendedSongs.push(...additionalSongs);
    }

    res.json({
      type: 'Personalized Taste Matching',
      primaryGenres: topGenres,
      songs: recommendedSongs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mood-based recommendations
// @route   GET /api/recommendations/mood
// @access  Public/Private
export const getMoodRecommendations = async (req, res) => {
  const { mood } = req.query;

  if (!mood) {
    return res.status(400).json({ message: 'Mood parameter is required' });
  }

  // Map moods to target genres
  const moodGenreMap = {
    happy: ['Pop', 'Dance', 'Disco', 'Synthwave', 'Happy'],
    sad: ['Acoustic', 'Indie', 'Slow', 'Sad', 'Blues', 'RnB'],
    relaxed: ['Lo-Fi', 'Ambient', 'Classical', 'Jazz', 'Chill', 'Soul', 'Relaxed'],
    energetic: ['Rock', 'Electronic', 'Metal', 'Dance', 'Pop', 'Edm', 'Energetic'],
    focus: ['Ambient', 'Classical', 'Instrumental', 'Lo-Fi', 'Soundtrack', 'Focus'],
    workout: ['Electronic', 'Synthwave', 'Hip-Hop', 'Dance', 'Rock', 'Edm', 'Workout'],
    romantic: ['Soul', 'RnB', 'Slow', 'Romantic', 'Acoustic', 'Love']
  };

  const targetGenres = moodGenreMap[mood.toLowerCase()];

  if (!targetGenres) {
    return res.status(400).json({
      message: `Invalid mood: ${mood}. Choose from Happy, Sad, Relaxed, Energetic, Focus, Workout, Romantic`
    });
  }

  try {
    // Search songs matching mapped genres
    const genreRegexes = targetGenres.map(g => new RegExp(g, 'i'));
    const songs = await Song.find({
      genre: { $in: genreRegexes }
    })
      .sort({ playCount: -1, likeCount: -1 })
      .limit(15);

    res.json({
      mood,
      matchedGenres: targetGenres,
      songs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
