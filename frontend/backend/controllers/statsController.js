import ListeningHistory from '../models/ListeningHistory.js';
import Song from '../models/Song.js';

// @desc    Get user listening statistics
// @route   GET /api/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch full listening history for user
    const history = await ListeningHistory.find({ user: userId }).populate('song');
    const totalSongsPlayed = history.length;

    if (totalSongsPlayed === 0) {
      return res.json({
        totalSongsPlayed: 0,
        totalListeningTime: 0,
        mostPlayedArtist: 'N/A',
        mostPlayedSong: 'N/A',
        favoriteGenre: 'N/A',
        weeklyActivity: []
      });
    }

    let totalListeningTime = 0;
    const artistCounts = {};
    const songCounts = {};
    const genreCounts = {};

    history.forEach(item => {
      if (item.song) {
        totalListeningTime += item.song.duration || 0;

        const artist = item.song.artistName || 'Unknown Artist';
        artistCounts[artist] = (artistCounts[artist] || 0) + 1;

        const title = `${item.song.title} - ${artist}`;
        songCounts[title] = (songCounts[title] || 0) + 1;

        const genre = item.song.genre || 'Unknown Genre';
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });

    // Helper to find the max key
    const getMaxKey = (obj) => {
      return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b), 'N/A');
    };

    const mostPlayedArtist = getMaxKey(artistCounts);
    const mostPlayedSong = getMaxKey(songCounts);
    const favoriteGenre = getMaxKey(genreCounts);

    // 2. Weekly Activity Charting Data (plays per day for the last 7 days)
    const weeklyActivity = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await ListeningHistory.countDocuments({
        user: userId,
        playedAt: { $gte: dayStart, $lt: dayEnd }
      });

      weeklyActivity.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        plays: count
      });
    }

    res.json({
      totalSongsPlayed,
      totalListeningTime, // in seconds
      mostPlayedArtist,
      mostPlayedSong,
      favoriteGenre,
      weeklyActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
