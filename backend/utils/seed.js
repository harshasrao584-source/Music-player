import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// Load model definitions
import User from '../models/User.js';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Playlist from '../models/Playlist.js';
import Favorite from '../models/Favorite.js';
import ListeningHistory from '../models/ListeningHistory.js';

dotenv.config();

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Download helper with stream pipe and fallback
const downloadFile = async (url, filename) => {
  const destPath = path.join(uploadDir, filename);
  
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    console.log(`File already exists: ${filename}, skipping download.`);
    return `/uploads/${filename}`;
  }

  console.log(`Downloading ${filename} from ${url}...`);
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 15000 // 15s timeout
    });

    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Downloaded ${filename} successfully.`);
        resolve(`/uploads/${filename}`);
      });
      writer.on('error', (err) => {
        console.error(`Write error for ${filename}:`, err.message);
        writeDummyFile(destPath);
        resolve(`/uploads/${filename}`);
      });
    });
  } catch (err) {
    console.error(`Download failed for ${filename}:`, err.message);
    writeDummyFile(destPath);
    return `/uploads/${filename}`;
  }
};

// Writes a fallback tiny file so Mongoose record paths resolve
const writeDummyFile = (destPath) => {
  try {
    if (destPath.endsWith('.mp3')) {
      // Small 0.5s silent MP3 file or solid empty buffer
      const dummyMp3 = Buffer.from(
        '//uQxAAAAAAAAAAAAAAAAAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
        'base64'
      );
      fs.writeFileSync(destPath, dummyMp3);
    } else {
      // Tiny transparent PNG
      const dummyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(destPath, dummyPng);
    }
    console.log(`Wrote local fallback placeholder for file: ${path.basename(destPath)}`);
  } catch (e) {
    console.error(`Failed to write fallback placeholder:`, e.message);
  }
};

const runSeed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/melodyai');
    console.log('Database connected.');

    // 1. Clean existing records
    console.log('Cleaning existing collection data...');
    await User.deleteMany({});
    await Song.deleteMany({});
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Playlist.deleteMany({});
    await Favorite.deleteMany({});
    await ListeningHistory.deleteMany({});
    console.log('Collections cleared.');

    // 2. Create Users (hashed passwords via userSchema.pre hook)
    console.log('Seeding users...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@melodyai.com',
      password: 'admin123',
      role: 'admin',
      avatar: '/uploads/default-avatar.png'
    });

    const defaultUser = await User.create({
      username: 'user',
      email: 'user@melodyai.com',
      password: 'user123',
      role: 'user',
      avatar: '/uploads/default-avatar.png'
    });

    console.log(`Users seeded: \n- Admin: admin@melodyai.com (admin123) \n- User: user@melodyai.com (user123)`);



    // 3. Define Seed Data Structure
    const artistsData = [
      { name: 'Helix Project', bio: 'Helix Project is a synthetic electronic composer exploring spatial audio fields.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' },
      { name: 'Lumina', bio: 'Lumina is an acoustic indie outfit specializing in lo-fi beats and relaxing melodies.', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
      { name: 'Echo Forge', bio: 'Echo Forge is a high-tempo progressive metal project crafting energetic guitar loops.', coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80' },
      { name: 'Arijit Sen', bio: 'Arijit Sen is a modern playback singer and composer known for emotional Bollywood and Hindi pop tracks.', coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&q=80' },
      { name: 'Karthik Raja', bio: 'Karthik Raja crafts soulful Tamil acoustic melodies and contemporary cinema themes.', coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80' },
      { name: 'Puneeth Kumar', bio: 'Puneeth Kumar is an instrumentalist and singer delivering deep Kannada anthems and folk tunes.', coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80' },
      { name: 'Ramesh Naik', bio: 'Ramesh Naik is a traditional Tulu singer preserving coastal folk beats and cultural rhythm songs.', coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
      { name: 'Vineeth Hari', bio: 'Vineeth Hari is an indie Malayalam composer creating tranquil acoustic and lo-fi tracks from Kerala.', coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80' }
    ];

    const albumsData = [
      { title: 'Synthwave Dreams', artistName: 'Helix Project', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
      { title: 'Chill Whispers', artistName: 'Lumina', releaseYear: 2023, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
      { title: 'Iron Rhythm', artistName: 'Echo Forge', releaseYear: 2025, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
      { title: 'Bollywood Waves', artistName: 'Arijit Sen', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&q=80' },
      { title: 'Madras Vibes', artistName: 'Karthik Raja', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80' },
      { title: 'Sandalwood Beats', artistName: 'Puneeth Kumar', releaseYear: 2023, coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80' },
      { title: 'Tulunada Janapada', artistName: 'Ramesh Naik', releaseYear: 2022, coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
      { title: 'Kerala Rhythms', artistName: 'Vineeth Hari', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80' }
    ];

    const songsData = [
      {
        title: 'Helix Resonance',
        artistName: 'Helix Project',
        albumName: 'Synthwave Dreams',
        genre: 'Electronic',
        duration: 372,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
        audioFilename: 'song-electronic.mp3',
        coverFilename: 'cover-electronic.jpg'
      },
      {
        title: 'Neon Horizon',
        artistName: 'Helix Project',
        albumName: 'Synthwave Dreams',
        genre: 'Synthwave',
        duration: 423,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        audioFilename: 'song-synthwave.mp3',
        coverFilename: 'cover-synthwave.jpg'
      },
      {
        title: 'Acoustic Solitude',
        artistName: 'Lumina',
        albumName: 'Chill Whispers',
        genre: 'Acoustic',
        duration: 302,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
        audioFilename: 'song-acoustic.mp3',
        coverFilename: 'cover-acoustic.jpg'
      },
      {
        title: 'Midnight Lo-Fi',
        artistName: 'Lumina',
        albumName: 'Chill Whispers',
        genre: 'Lo-Fi',
        duration: 302,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        audioFilename: 'song-lofi.mp3',
        coverFilename: 'cover-lofi.jpg'
      },
      {
        title: 'Ambient Focus',
        artistName: 'Lumina',
        albumName: 'Chill Whispers',
        genre: 'Ambient',
        duration: 362,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        audioFilename: 'song-ambient.mp3',
        coverFilename: 'cover-ambient.jpg'
      },
      {
        title: 'Heavy Forge Pulse',
        artistName: 'Echo Forge',
        albumName: 'Iron Rhythm',
        genre: 'Rock',
        duration: 582,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
        audioFilename: 'song-rock.mp3',
        coverFilename: 'cover-rock.jpg'
      },
      {
        title: 'Dil Se Beats (Hindi Pop)',
        artistName: 'Arijit Sen',
        albumName: 'Bollywood Waves',
        genre: 'Happy',
        duration: 412,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&q=80',
        audioFilename: 'song-hindi.mp3',
        coverFilename: 'cover-hindi.jpg'
      },
      {
        title: 'Tamil Kadavule Melody',
        artistName: 'Karthik Raja',
        albumName: 'Madras Vibes',
        genre: 'Romantic',
        duration: 518,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80',
        audioFilename: 'song-tamil.mp3',
        coverFilename: 'cover-tamil.jpg'
      },
      {
        title: 'Karunada Vaibhava Anthem',
        artistName: 'Puneeth Kumar',
        albumName: 'Sandalwood Beats',
        genre: 'Focus',
        duration: 492,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80',
        audioFilename: 'song-kannada.mp3',
        coverFilename: 'cover-kannada.jpg'
      },
      {
        title: 'Mokeda Singari Folk',
        artistName: 'Ramesh Naik',
        albumName: 'Tulunada Janapada',
        genre: 'Workout',
        duration: 531,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80',
        audioFilename: 'song-tulu.mp3',
        coverFilename: 'cover-tulu.jpg'
      },
      {
        title: 'Malabar Cafe Calm',
        artistName: 'Vineeth Hari',
        albumName: 'Kerala Rhythms',
        genre: 'Relaxed',
        duration: 472,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80',
        audioFilename: 'song-malayalam.mp3',
        coverFilename: 'cover-malayalam.jpg'
      },
      {
        title: 'English Retro Beats',
        artistName: 'Helix Project',
        albumName: 'Synthwave Dreams',
        genre: 'Energetic',
        duration: 452,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        audioFilename: 'song-english-retro.mp3',
        coverFilename: 'cover-english-retro.jpg'
      }
    ];

    // 4. Seed Artists
    console.log('Downloading artist images and seeding artists...');
    const seededArtists = {};
    for (const art of artistsData) {
      const coverPath = await downloadFile(art.coverUrl, `artist-${art.name.toLowerCase().replace(/ /g, '-')}.jpg`);
      const artist = await Artist.create({
        name: art.name,
        bio: art.bio,
        imageUrl: coverPath
      });
      seededArtists[art.name] = artist;
    }

    // 5. Seed Albums
    console.log('Downloading album covers and seeding albums...');
    const seededAlbums = {};
    for (const alb of albumsData) {
      const artist = seededArtists[alb.artistName];
      const coverPath = await downloadFile(alb.coverUrl, `album-${alb.title.toLowerCase().replace(/ /g, '-')}.jpg`);
      const album = await Album.create({
        title: alb.title,
        artist: artist._id,
        releaseYear: alb.releaseYear,
        coverUrl: coverPath
      });
      seededAlbums[alb.title] = album;
    }

    // 6. Seed Songs
    console.log('Downloading audio files and seeding songs (this might take a minute)...');
    const seededSongs = [];
    for (const s of songsData) {
      const artist = seededArtists[s.artistName];
      const album = seededAlbums[s.albumName];

      const coverPath = await downloadFile(s.coverUrl, s.coverFilename);
      const audioPath = await downloadFile(s.audioUrl, s.audioFilename);

      const song = await Song.create({
        title: s.title,
        artist: artist._id,
        artistName: artist.name,
        album: album._id,
        albumName: album.title,
        genre: s.genre,
        duration: s.duration,
        coverUrl: coverPath,
        audioUrl: audioPath,
        playCount: Math.floor(Math.random() * 100) + 10,
        likeCount: Math.floor(Math.random() * 20) + 5
      });
      seededSongs.push(song);
    }
    console.log(`${seededSongs.length} songs seeded successfully.`);

    // 7. Create a Sample Playlist for the default user
    console.log('Seeding sample playlists...');
    const playlist = await Playlist.create({
      name: 'Summer Lo-Fi Relax',
      description: 'Chill and focused vibes for studying and working.',
      isPrivate: false,
      user: defaultUser._id,
      songs: [seededSongs[2]._id, seededSongs[3]._id, seededSongs[4]._id] // Acoustic, Lo-fi, Ambient
    });

    // 8. Create some dummy favorites and play history to populate analytics immediately
    console.log('Seeding favorites and playing logs for stats demonstration...');
    
    // Add default user favorites
    await Favorite.create({ user: defaultUser._id, song: seededSongs[1]._id }); // Neon Horizon
    await Favorite.create({ user: defaultUser._id, song: seededSongs[3]._id }); // Midnight Lo-Fi

    // Add play logs over the last 5 days
    const nowDays = new Date();
    for (let i = 0; i < 25; i++) {
      const randomSong = seededSongs[Math.floor(Math.random() * seededSongs.length)];
      const playedDate = new Date();
      playedDate.setDate(nowDays.getDate() - Math.floor(Math.random() * 6)); // Random date in last 6 days
      playedDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      await ListeningHistory.create({
        user: defaultUser._id,
        song: randomSong._id,
        playedAt: playedDate,
        listenDuration: Math.floor(Math.random() * randomSong.duration)
      });
    }

    console.log('Seeding process completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error.message);
    mongoose.connection.close();
  }
};

runSeed();
