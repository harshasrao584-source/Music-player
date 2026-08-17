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

    const rawSongs = [
      ["Tum Hi Ho","Arijit Singh","Aashiqui 2","Hindi","Romantic","4:22"],
      ["Kesariya","Arijit Singh","Brahmāstra","Hindi","Romantic","4:28"],
      ["Channa Mereya","Arijit Singh","Ae Dil Hai Mushkil","Hindi","Romantic","4:49"],
      ["Tujh Mein Rab Dikhta Hai","Roop Kumar Rathod","Rab Ne Bana Di Jodi","Hindi","Romantic","4:41"],
      ["Agar Tum Saath Ho","Alka Yagnik, Arijit Singh","Tamasha","Hindi","Romantic","5:41"],
      ["Apna Bana Le","Arijit Singh","Bhediya","Hindi","Romantic","4:21"],
      ["Shayad","Arijit Singh","Love Aaj Kal","Hindi","Romantic","4:07"],
      ["Raataan Lambiyan","Jubin Nautiyal, Asees Kaur","Shershaah","Hindi","Romantic","3:50"],
      ["Kal Ho Naa Ho","Sonu Nigam","Kal Ho Naa Ho","Hindi","Romantic","5:21"],
      ["Kabira","Tochi Raina, Rekha Bhardwaj","Yeh Jawaani Hai Deewani","Hindi","Folk","3:43"],
      ["Ilahi","Arijit Singh","Yeh Jawaani Hai Deewani","Hindi","Travel","3:49"],
      ["Hawayein","Arijit Singh","Jab Harry Met Sejal","Hindi","Romantic","4:49"],
      ["Gerua","Arijit Singh, Antara Mitra","Dilwale","Hindi","Romantic","5:45"],
      ["Jeene Laga Hoon","Atif Aslam, Shreya Ghoshal","Ramaiya Vastavaiya","Hindi","Romantic","3:56"],
      ["Tera Ban Jaunga","Akhil Sachdeva, Tulsi Kumar","Kabir Singh","Hindi","Romantic","3:56"],
      ["O Maahi","Arijit Singh","Dunki","Hindi","Romantic","3:53"],
      ["Heeriye","Jasleen Royal, Arijit Singh","Heeriye","Hindi","Pop","3:14"],
      ["Samjhawan","Arijit Singh, Shreya Ghoshal","Humpty Sharma Ki Dulhania","Hindi","Romantic","4:29"],
      ["Ve Kamleya","Arijit Singh, Shreya Ghoshal","Rocky Aur Rani Kii Prem Kahaani","Hindi","Romantic","4:07"],
      ["Satranga","Arijit Singh","Animal","Hindi","Romantic","4:31"],
      ["Perfect","Ed Sheeran","÷ (Divide)","English","Pop","4:23"],
      ["Shape of You","Ed Sheeran","÷ (Divide)","English","Pop","3:53"],
      ["Photograph","Ed Sheeran","x (Multiply)","English","Pop","4:18"],
      ["Someone Like You","Adele","21","English","Pop","4:45"],
      ["Rolling in the Deep","Adele","21","English","Pop","3:48"],
      ["Love Story","Taylor Swift","Fearless","English","Country Pop","3:55"],
      ["Blank Space","Taylor Swift","1989","English","Pop","3:51"],
      ["Cruel Summer","Taylor Swift","Lover","English","Pop","2:58"],
      ["Until I Found You","Stephen Sanchez","Easy On My Eyes","English","Pop","2:57"],
      ["Let Me Down Slowly","Alec Benjamin","Narrated for You","English","Pop","2:49"],
      ["Attention","Charlie Puth","Voicenotes","English","Pop","3:31"],
      ["We Don't Talk Anymore","Charlie Puth, Selena Gomez","Nine Track Mind","English","Pop","3:37"],
      ["See You Again","Wiz Khalifa, Charlie Puth","Furious 7","English","Hip-Hop","3:49"],
      ["Faded","Alan Walker","Different World","English","EDM","3:32"],
      ["On My Way","Alan Walker, Sabrina Carpenter, Farruko","Different World","English","EDM","3:13"],
      ["Believer","Imagine Dragons","Evolve","English","Rock","3:24"],
      ["Demons","Imagine Dragons","Night Visions","English","Rock","2:55"],
      ["Counting Stars","OneRepublic","Native","English","Pop Rock","4:17"],
      ["Memories","Maroon 5","Jordi","English","Pop","3:09"],
      ["Stay","The Kid LAROI, Justin Bieber","F*ck Love 3: Over You","English","Pop","2:21"],
      ["Anisuthide Yaako Indu","Sonu Nigam","Mungaru Male","Kannada","Romantic","4:34"],
      ["Jotheyali Jothe Jotheyali","S. P. Balasubrahmanyam, S. Janaki","Geetha","Kannada","Romantic","4:35"],
      ["Ninnindale","Sonu Nigam","Milana","Kannada","Romantic","4:23"],
      ["Bombe Helutaite","Vijay Prakash","Raajakumara","Kannada","Romantic","4:10"],
      ["Belageddu","Vijay Prakash","Kirik Party","Kannada","Romantic","3:42"],
      ["Marali Manasagide","Armaan Malik","Gentleman","Kannada","Romantic","3:55"],
      ["Paravashanadenu","Sonu Nigam, Shreya Ghoshal","Paramathma","Kannada","Romantic","4:28"],
      ["Minchagi Neenu Baralu","Sonu Nigam","Gaalipata","Kannada","Romantic","4:24"],
      ["Kariya I Love You","Various Artists","Kariya","Kannada","Romantic","4:30"],
      ["Ondu Malebillu","Armaan Malik, Shreya Ghoshal","Chakravarthy","Kannada","Romantic","4:40"],
      ["Mugulu Nage","Sonu Nigam","Mugulu Nage","Kannada","Romantic","4:18"],
      ["No Problem","Various Artists","No Problem","Kannada","Dance","4:00"],
      ["Yava Mohana Murali","Various Artists","Mysore Mallige","Kannada","Classical","4:12"],
      ["Hrudayake Hedarike","Sonu Nigam","Duniya","Kannada","Romantic","4:25"],
      ["Bombe Bombe","Various Artists","Premada Kanike","Kannada","Romantic","4:10"],
      ["Aaye Aaye","Various Artists","Tulu Hits","Tulu","Folk","4:00"],
      ["Kambla","Various Artists","Tulu Folk Hits","Tulu","Folk","3:45"],
      ["Pudaraya","Various Artists","Tulu Folk Hits","Tulu","Folk","4:05"],
      ["Malaraya","Various Artists","Tulu Folk Hits","Tulu","Folk","3:58"],
      ["Eeregla","Various Artists","Tulu Hits","Tulu","Pop","4:02"],
      ["Baale Baale","Various Artists","Tulu Hits","Tulu","Folk","3:50"],
      ["Daanu Daanu","Various Artists","Tulu Hits","Tulu","Pop","3:55"],
      ["Kori Kori","Various Artists","Tulu Hits","Tulu","Folk","4:01"],
      ["Mangaluru","Various Artists","Tulu Hits","Tulu","Folk","4:10"],
      ["Tulu Nadu","Various Artists","Tulu Folk Collection","Tulu","Folk","4:15"],
      ["Malare","Vijay Yesudas","Premam","Malayalam","Romantic","4:16"],
      ["Pavizha Mazha","K. S. Harisankar","Athiran","Malayalam","Romantic","3:54"],
      ["Darshana","Hesham Abdul Wahab, Darshana Rajendran","Hridayam","Malayalam","Romantic","3:47"],
      ["Jeevamshamayi","K. S. Harisankar, Shreya Ghoshal","Theevandi","Malayalam","Romantic","5:20"],
      ["Onakka Munthiri","Divya Vineeth","Hridayam","Malayalam","Pop","2:45"],
      ["Uyiril Thodum","Sooraj Santhosh, Anne Amie","Kumbalangi Nights","Malayalam","Romantic","3:58"],
      ["Aaro Nenjil","Gopi Sundar","Godha","Malayalam","Romantic","3:48"],
      ["Parayuvaan","Sid Sriram, Neha S. Nair","Ishq","Malayalam","Romantic","3:53"],
      ["Theerame","K. S. Harisankar, Ayraan","Malik","Malayalam","Romantic","4:24"],
      ["Puthiyoru Pathayil","Nazriya Nazim, Sreenath Bhasi","Varathan","Malayalam","Romantic","3:05"],
      ["Inkem Inkem Inkem Kaavaale","Sid Sriram","Geetha Govindam","Telugu","Romantic","4:04"],
      ["Samajavaragamana","Sid Sriram","Ala Vaikunthapurramuloo","Telugu","Romantic","3:52"],
      ["Butta Bomma","Armaan Malik","Ala Vaikunthapurramuloo","Telugu","Pop","3:18"],
      ["Vachindamma","Sid Sriram","Geetha Govindam","Telugu","Romantic","4:07"],
      ["Maate Vinadhuga","Sid Sriram","Taxiwaala","Telugu","Romantic","4:01"],
      ["Adiga Adiga","Sid Sriram","Ninnu Kori","Telugu","Romantic","3:40"],
      ["Oh Sita Hey Rama","S. P. Charan, Ramya Behara","Sita Ramam","Telugu","Romantic","3:38"],
      ["Srivalli","Sid Sriram","Pushpa: The Rise","Telugu","Romantic","3:44"],
      ["Naatu Naatu","Rahul Sipligunj, Kaala Bhairava","RRR","Telugu","Dance","3:28"],
      ["Kalavathi","Sid Sriram","Sarkaru Vaari Paata","Telugu","Romantic","4:02"],
      ["Vaseegara","Bombay Jayashri","Minnale","Tamil","Romantic","4:59"],
      ["Munbe Vaa","Shreya Ghoshal, Naresh Iyer","Sillunu Oru Kaadhal","Tamil","Romantic","5:01"],
      ["Why This Kolaveri Di","Dhanush","3","Tamil","Pop","4:04"],
      ["Rowdy Baby","Dhanush, Dhee","Maari 2","Tamil","Dance","4:41"],
      ["Arabic Kuthu","Anirudh Ravichander, Jonita Gandhi","Beast","Tamil","Dance","4:39"],
      ["Vaathi Coming","Anirudh Ravichander","Master","Tamil","Dance","3:49"],
      ["Hukum","Anirudh Ravichander","Jailer","Tamil","Mass","3:27"],
      ["Marana Mass","Anirudh Ravichander","Petta","Tamil","Mass","3:36"],
      ["Enjoy Enjaami","Dhee, Arivu","Enjoy Enjaami","Tamil","Folk Pop","4:39"],
      ["Kanave Unai","Various Artists","Tamil Melodies","Tamil","Romantic","4:00"],
      ["Unakkenna Venum Sollu","Harris Jayaraj","Yennai Arindhaal","Tamil","Romantic","4:52"],
      ["Thalli Pogathey","Sid Sriram","Achcham Enbadhu Madamaiyada","Tamil","Romantic","4:27"],
      ["Innum Konjam Neram","Vijay Prakash, Shweta Mohan","Maryan","Tamil","Romantic","5:12"],
      ["Anbil Avan","Vinnathaandi Varuvaayaa","Vinnaithaandi Varuvaayaa","Tamil","Romantic","4:10"],
      ["New York Nagaram","A. R. Rahman","Sillunu Oru Kaadhal","Tamil","Romantic","6:17"]
    ];

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

    const parseDuration = (durationStr) => {
      const parts = durationStr.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      return parseInt(durationStr, 10) || 180;
    };

    console.log(`Seeding ${rawSongs.length} songs...`);
    const seededArtists = {};
    const seededAlbums = {};
    const seededSongs = [];

    for (let i = 0; i < rawSongs.length; i++) {
      const [title, artistName, albumName, language, genre, durationStr] = rawSongs[i];

      // 1. Resolve / Create Artist
      let artist = seededArtists[artistName];
      if (!artist) {
        const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const artistCoverUrl = coverUrlsList[Object.keys(seededArtists).length % coverUrlsList.length];
        const artistCoverPath = await downloadFile(artistCoverUrl, `artist-${artistSlug}.jpg`);
        artist = await Artist.create({
          name: artistName,
          bio: `${artistName} is a featured artist.`,
          imageUrl: process.env.NODE_ENV === 'production' ? artistCoverUrl : artistCoverPath
        });
        seededArtists[artistName] = artist;
      }

      // 2. Resolve / Create Album
      const albumKey = `${artistName}_${albumName}`;
      let album = seededAlbums[albumKey];
      if (!album) {
        const albumSlug = albumName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const albumCoverUrl = coverUrlsList[Object.keys(seededAlbums).length % coverUrlsList.length];
        const albumCoverPath = await downloadFile(albumCoverUrl, `album-${albumSlug}.jpg`);
        album = await Album.create({
          title: albumName,
          artist: artist._id,
          releaseYear: 2024,
          coverUrl: process.env.NODE_ENV === 'production' ? albumCoverUrl : albumCoverPath
        });
        seededAlbums[albumKey] = album;
      }

      // 3. Create Song
      const duration = parseDuration(durationStr);
      const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`;
      const audioFilename = `song-seed-${(i % 16) + 1}.mp3`;
      await downloadFile(audioUrl, audioFilename);
      const audioPath = process.env.NODE_ENV === 'production' ? audioUrl : `/uploads/${audioFilename}`;

      const coverUrl = coverUrlsList[i % coverUrlsList.length];
      const coverFilename = `cover-seed-${(i % 10) + 1}.jpg`;
      const coverPath = await downloadFile(coverUrl, coverFilename);
      const finalCoverUrl = process.env.NODE_ENV === 'production' ? coverUrl : coverPath;

      const song = await Song.create({
        title: title,
        artist: artist._id,
        artistName: artist.name,
        album: album._id,
        albumName: album.title,
        genre: genre,
        language: language,
        duration: duration,
        coverUrl: finalCoverUrl,
        audioUrl: audioPath,
        playCount: Math.floor(Math.random() * 100) + 10,
        likeCount: Math.floor(Math.random() * 20) + 5
      });
      seededSongs.push(song);
    }
    console.log(`${seededSongs.length} songs seeded successfully.`);

    // 7. Create a Sample Playlist for the default user
    console.log('Seeding sample playlists...');
    await Playlist.create({
      name: 'Summer Lo-Fi Relax',
      description: 'Chill and focused vibes for studying and working.',
      isPrivate: false,
      user: defaultUser._id,
      songs: [seededSongs[2]._id, seededSongs[3]._id, seededSongs[4]._id]
    });

    // 8. Create some dummy favorites and play history to populate analytics immediately
    console.log('Seeding favorites and playing logs for stats demonstration...');
    await Favorite.create({ user: defaultUser._id, song: seededSongs[1]._id });
    await Favorite.create({ user: defaultUser._id, song: seededSongs[3]._id });

    const nowDays = new Date();
    for (let i = 0; i < 25; i++) {
      const randomSong = seededSongs[Math.floor(Math.random() * seededSongs.length)];
      const playedDate = new Date();
      playedDate.setDate(nowDays.getDate() - Math.floor(Math.random() * 6));
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
