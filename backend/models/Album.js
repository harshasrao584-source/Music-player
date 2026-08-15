import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  releaseYear: {
    type: Number
  }
}, {
  timestamps: true
});

const Album = mongoose.model('Album', albumSchema);
export default Album;
