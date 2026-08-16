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

// Load Env variables from current directory or backend directory
if (fs.existsSync(path.resolve('.env'))) {
  dotenv.config({ path: path.resolve('.env') });
} else if (fs.existsSync(path.resolve('backend', '.env'))) {
  dotenv.config({ path: path.resolve('backend', '.env') });
} else {
  dotenv.config();
}

const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads');
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

const runSeed = async (customURI = null, shouldClose = true) => {
  const primaryURI = customURI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/melodyai';
  const fallbackURI = 'mongodb://127.0.0.1:27017/melodyai';

  try {
    console.log(`Connecting to MongoDB: ${primaryURI}...`);
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Database connected.');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    if (primaryURI !== fallbackURI) {
      try {
        console.log(`Attempting fallback connection to local MongoDB: ${fallbackURI}...`);
        await mongoose.connect(fallbackURI, {
          serverSelectionTimeoutMS: 5000
        });
        console.log('Database connected (Fallback).');
      } catch (fallbackError) {
        console.error(`Fallback Database connection error: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  try {
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

    // Drop old indexes to clear the faulty language-override settings cached on Atlas
    try {
      await Song.collection.dropIndexes();
      console.log('Song collection indexes dropped.');
    } catch (err) {
      console.log('No existing song indexes to drop.');
    }

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
    // 3. Define Seed Data Structure with Famous Real-World Artists
    const artistsData = [
      { name: 'Ed Sheeran', bio: 'Edward Christopher Sheeran is a globally celebrated English singer-songwriter and pop icon.', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
      { name: 'Arijit Singh', bio: 'Arijit Singh is a legendary Indian playback singer known for soulful romantic Hindi pop ballads.', coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&q=80' },
      { name: 'Anirudh Ravichander', bio: 'Anirudh is a leading music composer and singer dominating the Tamil and South Indian film music industry.', coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80' },
      { name: 'Vijay Prakash', bio: 'Vijay Prakash is an acclaimed Indian playback singer and composer delivering rich Kannada melodies.', coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80' },
      { name: 'Traditional Coastal', bio: 'Traditional folk musicians and groups preserving the cultural beats of Tulunadu.', coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
      { name: 'Vineeth Sreenivasan', bio: 'Vineeth is a multi-talented Malayalam playback singer, actor, director, and lyricist.', coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80' },
      { name: 'Sid Sriram', bio: 'Sid Sriram is a prominent Carnatic-trained playback singer popular for Telugu romantic melodies.', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' }
    ];

    const albumsData = [
      { title: 'Divide & Collab', artistName: 'Ed Sheeran', releaseYear: 2017, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
      { title: 'Bollywood Magic', artistName: 'Arijit Singh', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&q=80' },
      { title: 'Madras Hits', artistName: 'Anirudh Ravichander', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80' },
      { title: 'Sandalwood Gems', artistName: 'Vijay Prakash', releaseYear: 2023, coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80' },
      { title: 'Tulunada Folk', artistName: 'Traditional Coastal', releaseYear: 2022, coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
      { title: 'Mollywood Vibe', artistName: 'Vineeth Sreenivasan', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80' },
      { title: 'Tollywood Classics', artistName: 'Sid Sriram', releaseYear: 2024, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' }
    ];

    // Generate 100 songs programmatically to populate the database with a massive catalog
    const languages = ['Hindi', 'English', 'Tamil', 'Kannada', 'Tulu', 'Malayalam', 'Telugu'];
    const genres = ['Happy', 'Sad', 'Relaxed', 'Energetic', 'Focus', 'Workout', 'Romantic'];
    
    const mockTitles = {
      Hindi: ['Kesariya', 'Apna Bana Le', 'Tum Hi Ho', 'Channa Mereya', 'Kabira', 'Pehla Nasha', 'Mitwa', 'Kal Ho Naa Ho', 'Gali Mein Aaj Chand', 'Zalima', 'Raataan Lambiyan', 'Dil Diyan Gallan', 'Tere Sang Yaara', 'Heeriye', 'Janiye'],
      English: ['Shape of You', 'Blinding Lights', 'Stay', 'As It Was', 'Flowers', 'Perfect', 'Someone Like You', 'Bad Habits', 'Let Me Love You', 'Attention', 'Believer', 'Starboy', 'Thinking Out Loud', 'Photograph', 'Love Yourself'],
      Tamil: ['Rowdy Baby', 'Kolaveri Di', 'Arabic Kuthu', 'Kaala Chashma Tamil', 'Vaseegara', 'Tum Tum', 'Kannazhaga', 'Naattu Koothu', 'Mangalyam', 'Enna Sona Tamil', 'Neeye', 'Kadhale Kadhale', 'Theri Anthem', 'Aalaporaan Tamilan', 'Anbil Avan'],
      Kannada: ['Singara Siriye', 'Belageddu', 'KGF Salaam Rocky Bhai', 'Raajakumara', 'Dheera Dheera KGF', 'Tagaru Banthu Tagaru', 'Ninna Gungalli', 'Bombe Helutaithe', 'Yarivalu', 'Chanda Chanda', 'Gombe Gombe', 'Natasaarvabhowma', 'Nee Sanihake', 'Sanju Geetha', 'Karunada Sound'],
      Tulu: ['Mokeda Singari', 'Banta Aata', 'Pilibail Yamunakka', 'Solluda Vibe', 'Namma Tulunad', 'Coastal Rhythm', 'Porlu Tulu', 'Siri Jatre', 'Kalasa Folk', 'Aatadonji', 'Karavali Folk', 'Ranga Ranga', 'Bale Tulu', 'Singari Part 2', 'Tulunada Siri'],
      Malayalam: ['Jimikki Kammal', 'Darshana', 'Malare', 'Pala Palli', 'Kavithaye', 'Lailakame', 'Chinnamma', 'Thiruvaavanira', 'Indie Malabar', 'Aanandham', 'Kalyani', 'Indie Kerala', 'Malabar Coast', 'Premam Vibe', 'Kavitha Calm'],
      Telugu: ['Naatu Naatu', 'Samajavaragamana', 'Butta Bomma', 'Oo Antava Mava', 'Srivalli', 'Inkem Inkem Inkem Kaavaale', 'Adiga Adiga', 'Ramuloo Ramulaa', 'Pushpa Blast', 'Tollywood Retro', 'Vennela Beats', 'Chitti Beat', 'Geetha Govindam', 'Prema Vennela', 'Nuvvu Nenu Prema']
    };

    const songsData = [];

    for (let i = 0; i < 100; i++) {
      const language = languages[i % languages.length];
      const genre = genres[i % genres.length];
      
      const titlesList = mockTitles[language];
      const baseTitle = titlesList[Math.floor(i / languages.length) % titlesList.length];
      const title = `${baseTitle} (Vol. ${Math.floor(i / (languages.length * titlesList.length)) + 1})`;
      
      let artistName = 'Ed Sheeran';
      let albumName = 'Divide & Collab';
      
      if (language === 'Hindi') {
        artistName = 'Arijit Singh';
        albumName = 'Bollywood Magic';
      } else if (language === 'Tamil') {
        artistName = 'Anirudh Ravichander';
        albumName = 'Madras Hits';
      } else if (language === 'Kannada') {
        artistName = 'Vijay Prakash';
        albumName = 'Sandalwood Gems';
      } else if (language === 'Tulu') {
        artistName = 'Traditional Coastal';
        albumName = 'Tulunada Folk';
      } else if (language === 'Malayalam') {
        artistName = 'Vineeth Sreenivasan';
        albumName = 'Mollywood Vibe';
      } else if (language === 'Telugu') {
        artistName = 'Sid Sriram';
        albumName = 'Tollywood Classics';
      }

      // We cycle through 16 SoundHelix song links to share physical file downloads
      const trackIndex = (i % 16) + 1;
      const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackIndex}.mp3`;
      const audioFilename = `song-seed-${trackIndex}.mp3`;

      // Cycle cover art unsplash links
      const coverUrlsList = [
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
        'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=500&q=80',
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&q=80',
        'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80'
      ];
      const coverUrl = coverUrlsList[i % coverUrlsList.length];
      const coverFilename = `cover-seed-${(i % 10) + 1}.jpg`;

      songsData.push({
        title,
        artistName,
        albumName,
        genre,
        language,
        duration: 240 + (i * 7) % 180,
        audioUrl,
        coverUrl,
        audioFilename,
        coverFilename
      });
    }

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
        language: s.language,
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
    if (shouldClose) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
    if (shouldClose) {
      mongoose.connection.close();
    }
  }
};

export { runSeed };

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  runSeed();
}
