import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Pause, Heart, Smile, Brain, Flame, Sparkles, BookOpen, Coffee, HeartHandshake } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);

  const [greeting, setGreeting] = useState('Welcome');
  const [recommendations, setRecommendations] = useState([]);
  const [recType, setRecType] = useState('Trending Tracks');
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [moodSongs, setMoodSongs] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine Greeting based on time of day
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch general song catalog
      const songsRes = await axios.get('/songs?limit=12');
      setAllSongs(songsRes.data.songs || []);

      // 2. Fetch recommendations (Personalized if logged in, else Trending)
      if (user) {
        try {
          const recRes = await axios.get('/recommendations/personalized');
          setRecommendations(recRes.data.songs || []);
          setRecType(recRes.data.type || 'Personalized Taste Matching');
        } catch (e) {
          console.error('Error fetching personalized recommendations:', e.message);
        }

        // 3. Fetch recently played history
        try {
          const histRes = await axios.get('/history');
          // Extract unique songs from history log entries
          const uniqueSongs = [];
          const seen = new Set();
          histRes.data.forEach(item => {
            if (item.song && !seen.has(item.song._id)) {
              seen.add(item.song._id);
              uniqueSongs.push(item.song);
            }
          });
          setRecentlyPlayed(uniqueSongs.slice(0, 6));
        } catch (e) {
          console.error('Error fetching history:', e.message);
        }
      } else {
        // Fallback for guest accounts: recommendations = trending
        const trendingRes = await axios.get('/songs?limit=6');
        setRecommendations(trendingRes.data.songs || []);
        setRecType('Trending Now');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Mood Selection
  const handleMoodSelect = async (mood) => {
    if (selectedMood === mood) {
      setSelectedMood(null);
      setMoodSongs([]);
      return;
    }

    setSelectedMood(mood);
    try {
      const res = await axios.get(`/recommendations/mood?mood=${mood.name}`);
      setMoodSongs(res.data.songs || []);
    } catch (err) {
      console.error('Failed to fetch mood recommendations:', err.message);
    }
  };

  const moods = [
    { name: 'Happy', emoji: '😃', color: 'from-amber-400 to-orange-500', icon: Smile },
    { name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-600', icon: Coffee },
    { name: 'Relaxed', emoji: '😌', color: 'from-teal-400 to-emerald-600', icon: HeartHandshake },
    { name: 'Energetic', emoji: '⚡', color: 'from-rose-500 to-fuchsia-600', icon: Flame },
    { name: 'Focus', emoji: '🎯', color: 'from-purple-500 to-violet-700', icon: Brain },
    { name: 'Workout', emoji: '🏋️', color: 'from-orange-500 to-red-600', icon: Flame },
    { name: 'Romantic', emoji: '💖', color: 'from-pink-400 to-rose-500', icon: Sparkles }
  ];

  const handlePlaySong = (song, queueList) => {
    playSong(song, queueList);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 w-1/4 rounded-lg" />
        <div className="h-20 bg-white/5 w-full rounded-2xl" />
        <div className="h-64 bg-white/5 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[var(--text-primary)] select-none">
      
      {/* Time Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-outfit">
          {greeting}, {user ? user.username : 'Listener'}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {user ? 'Here is your personalized smart feed.' : 'Log in to unlock personalized AI recommendations!'}
        </p>
      </div>

      {/* Mood Picker Carousel */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-violet-400 uppercase tracking-wider text-xs">How are you feeling today?</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood && selectedMood.name === mood.name;
            return (
              <button
                key={mood.name}
                onClick={() => handleMoodSelect(mood)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-full font-medium transition-all shrink-0 hover:scale-105 ${
                  isSelected
                    ? 'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 border border-transparent'
                    : 'bg-white/5 dark:bg-black/20 border border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-sm">{mood.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mood Station Track List */}
      {selectedMood && (
        <section className="glass-card rounded-3xl p-6 border border-violet-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Mood Station: <span className="text-violet-400">{selectedMood.name} Vibes</span></h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Custom AI filtered tracks matching your vibe</p>
            </div>
            <span className="text-lg">{selectedMood.emoji}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {moodSongs.map((song) => (
              <div
                key={song._id}
                onClick={() => handlePlaySong(song, moodSongs)}
                className="group relative cursor-pointer p-3 rounded-2xl bg-white/5 border border-transparent hover:border-[var(--border-color)] transition-all hover:bg-white/10 dark:hover:bg-white/5"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                  <img
                    src={song.coverUrl || '/uploads/default-cover.png'}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-semibold truncate">{song.title}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{song.artistName}</p>
              </div>
            ))}
            {moodSongs.length === 0 && (
              <p className="col-span-full text-center text-xs text-[var(--text-secondary)] py-6">No matching songs in library</p>
            )}
          </div>
        </section>
      )}

      {/* AI Personalized Recommendations / Trending */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{recType}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Recommendations refreshed in real-time based on your taste</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.slice(0, 6).map((song) => {
            const isCurrent = currentSong && currentSong._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => handlePlaySong(song, recommendations)}
                className="group p-3 rounded-2xl glass-card hover:bg-white/5 hover:border-[var(--border-color)] border border-transparent transition-all cursor-pointer relative"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3 shadow-md">
                  <img
                    src={song.coverUrl || '/uploads/default-cover.png'}
                    alt={song.title}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-semibold truncate text-[var(--text-primary)]">{song.title}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{song.artistName}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently Played */}
      {user && recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Pick up right where you left off</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyPlayed.map((song) => (
              <div
                key={song._id}
                onClick={() => handlePlaySong(song, recentlyPlayed)}
                className="group p-3 rounded-2xl glass-card hover:bg-white/5 hover:border-[var(--border-color)] border border-transparent transition-all cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3 shadow-md">
                  <img
                    src={song.coverUrl || '/uploads/default-cover.png'}
                    alt={song.title}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-semibold truncate">{song.title}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{song.artistName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Songs Catalog Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Explore the Library</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore our selection of seeded high-fidelity tracks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSongs.map((song) => {
            const isCurrent = currentSong && currentSong._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => handlePlaySong(song, allSongs)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                  isCurrent
                    ? 'bg-violet-600/10 border-violet-500/30'
                    : 'bg-white/5 border-transparent hover:border-[var(--border-color)] hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <img
                  src={song.coverUrl || '/uploads/default-cover.png'}
                  alt={song.title}
                  className="w-12 h-12 rounded-xl object-cover shadow"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{song.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{song.artistName} • {song.genre}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Home;
