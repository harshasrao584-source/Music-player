import fs from 'fs';
import path from 'path';

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

const songs = [];

for (let i = 0; i < 100; i++) {
  const language = languages[i % languages.length];
  const genre = genres[i % genres.length];
  
  const titlesList = mockTitles[language];
  const baseTitle = titlesList[Math.floor(i / languages.length) % titlesList.length];
  const title = `${baseTitle} (Vol. ${Math.floor(i / (languages.length * titlesList.length)) + 1})`;
  
  let artistName = 'Ed Sheeran';
  if (language === 'Hindi') artistName = 'Arijit Singh';
  else if (language === 'Tamil') artistName = 'Anirudh Ravichander';
  else if (language === 'Kannada') artistName = 'Vijay Prakash';
  else if (language === 'Tulu') artistName = 'Traditional Coastal';
  else if (language === 'Malayalam') artistName = 'Vineeth Sreenivasan';
  else if (language === 'Telugu') artistName = 'Sid Sriram';

  let albumName = 'Divide & Collab';
  if (language === 'Hindi') albumName = 'Bollywood Magic';
  else if (language === 'Tamil') albumName = 'Madras Hits';
  else if (language === 'Kannada') albumName = 'Sandalwood Gems';
  else if (language === 'Tulu') albumName = 'Tulunada Folk';
  else if (language === 'Malayalam') albumName = 'Mollywood Vibe';
  else if (language === 'Telugu') albumName = 'Tollywood Classics';

  const trackIndex = (i % 16) + 1;
  const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackIndex}.mp3`;
  const coverUrl = coverUrlsList[i % coverUrlsList.length];

  // Generate a mock MongoDB style 24-character hexadecimal ID
  const hex = i.toString(16).padStart(4, '0');
  const _id = `6081c6cfefc6ffcdad30${hex}77`;

  songs.push({
    _id,
    title,
    artistName,
    albumName,
    genre,
    language,
    duration: 240 + (i * 7) % 180,
    coverUrl,
    audioUrl,
    playCount: Math.floor(Math.random() * 100) + 10,
    likeCount: Math.floor(Math.random() * 20) + 5
  });
}

const dirPath = path.resolve('backend', 'data');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFileSync(
  path.join(dirPath, 'songsData.js'),
  `export const staticSongs = ${JSON.stringify(songs, null, 2)};\n`
);

console.log('Successfully generated 100 static songs in backend/data/songsData.js!');
