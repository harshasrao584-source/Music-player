import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
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
  artistName: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  albumName: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  playCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Text index for fast multi-field search
songSchema.index(
  { title: 'text', artistName: 'text', albumName: 'text', genre: 'text', language: 'text' },
  { language_override: 'none' }
);

const Song = mongoose.model('Song', songSchema);
export default Song;
