import ListeningHistory from '../models/ListeningHistory.js';

// @desc    Get user listening history
// @route   GET /api/history
// @access  Private
export const getListeningHistory = async (req, res) => {
  try {
    const history = await ListeningHistory.find({ user: req.user._id })
      .populate('song')
      .sort({ playedAt: -1 })
      .limit(30);

    // Filter out null references in case a song was deleted
    const filteredHistory = history.filter(h => h.song !== null);
    res.json(filteredHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear user listening history
// @route   DELETE /api/history
// @access  Private
export const clearListeningHistory = async (req, res) => {
  try {
    await ListeningHistory.deleteMany({ user: req.user._id });
    res.json({ message: 'Listening history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
