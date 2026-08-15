import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to guarantee uniqueness of user+song favorites
favoriteSchema.index({ user: 1, song: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
