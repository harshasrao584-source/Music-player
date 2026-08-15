import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    index: true
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  listenDuration: {
    type: Number, // duration in seconds
    default: 0
  }
}, {
  timestamps: true
});

const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);
export default ListeningHistory;
