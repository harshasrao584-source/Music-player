import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  AlignLeft,
  Heart
} from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';
import Equalizer from '../components/Equalizer';
import axios from 'axios';

// Sync lyrics data from LyricsPanel
const lyricsData = {
  'Helix Resonance': [
    { time: 0, text: '[Instrumental Intro]' },
    { time: 10, text: 'Walking through the digital rain' },
    { time: 25, text: 'Feeling the helix inside my brain' },
    { time: 40, text: 'Flashes of purple, fields of light' },
    { time: 55, text: 'Synth beats guide us through the night' },
    { time: 70, text: 'We are the coding, we are the sound' },
    { time: 85, text: 'In MelodyAI, our frequency is found' },
    { time: 100, text: '[Synth Drop - Interlude]' },
    { time: 130, text: 'Elevating state, climbing the peak' },
    { time: 150, text: 'Silent vibrations, the patterns we seek' }
  ],
  'Neon Horizon': [
    { time: 0, text: '[Synth Intro]' },
    { time: 15, text: 'Gridlines glowing in the dark' },
    { time: 30, text: 'Retro drives and a neon spark' },
    { time: 45, text: 'Racing down the highway line' },
    { time: 60, text: 'Chasing shadows, running out of time' },
    { time: 75, text: 'Underneath the purple sky' },
    { time: 90, text: 'Neon horizons, flying high' }
  ],
  'Acoustic Solitude': [
    { time: 0, text: '[Guitar Picking]' },
    { time: 12, text: 'Leaves are falling on the street' },
    { time: 28, text: 'A lonely walk, a quiet beat' },
    { time: 44, text: 'Solitude is a gentle friend' },
    { time: 60, text: 'Acoustic echoes start to blend' },
    { time: 76, text: 'No words needed, just the strings' },
    { time: 92, text: 'Peace is the comfort that it brings' }
  ],
  'Midnight Lo-Fi': [
    { time: 0, text: '[Vinyl Crackles & Coffee Shop Ambiance]' },
    { time: 10, text: 'Raindrops tapping on the glass' },
    { time: 30, text: 'Filtering low-pass, making it last' },
    { time: 50, text: 'Midnight study, typing slow' },
    { time: 70, text: 'Soft Rhodes piano, a steady flow' },
    { time: 90, text: 'Sip the coffee, clear the head' },
    { time: 110, text: 'Resting on the words unsaid' }
  ],
  'Ambient Focus': [
    { time: 0, text: '[Deep Ocean Pad swells]' },
    { time: 20, text: 'Enter the quiet, leave the crowd' },
    { time: 45, text: 'No distractions, no sound too loud' },
    { time: 70, text: 'A static frequency, breathing deep' },
    { time: 95, text: 'Promises of focus we intend to keep' },
    { time: 120, text: 'Floating weightless in the air' }
  ],
  'Heavy Forge Pulse': [
    { time: 0, text: '[Drums & Heavy Distorted Guitar Riff]' },
    { time: 15, text: 'Iron hammers hitting gold' },
    { time: 30, text: 'Stories of the forge retold' },
    { time: 45, text: 'Ripping solos, heavy beats' },
    { time: 60, text: 'Power runs through metal streets' },
    { time: 75, text: 'Raise the volume, feel the blast' },
    { time: 90, text: 'Forge the rhythm made to last' }
  ]
};

const FullscreenPlayer = ({ isOpen, onClose }) => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    progress,
    duration,
    isShuffle,
    isRepeat,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat
  } = useContext(AudioContext);

  const { user } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [activeLine, setActiveLine] = useState(-1);
  const lyricsContainerRef = useRef(null);

  const songLyrics = currentSong ? lyricsData[currentSong.title] : null;

  // Like status sync
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !currentSong) return;
      try {
        const res = await axios.get(`/favorites/status/${currentSong._id}`);
        setIsLiked(res.data.liked);
      } catch (err) {
        console.error(err.message);
      }
    };
    checkLikeStatus();
  }, [currentSong, user, isOpen]);

  // Sync lyrics lines
  useEffect(() => {
    if (!songLyrics) return;
    let index = -1;
    for (let i = 0; i < songLyrics.length; i++) {
      if (progress >= songLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setActiveLine(index);
  }, [progress, songLyrics]);

  // Scroll active lyric
  useEffect(() => {
    if (activeLine !== -1 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLine];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLine, showLyrics]);

  const handleToggleLike = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`/favorites/toggle/${currentSong._id}`);
      setIsLiked(res.data.liked);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!isOpen || !currentSong) return null;

  const bgImage = currentSong.coverUrl || '/uploads/default-cover.png';

  return (
    <div className="fixed inset-0 z-50 bg-[#060309] text-white flex flex-col justify-between overflow-hidden">
      
      {/* Blurred Album Artwork Ambient Canvas Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 scale-110 filter blur-[80px] transition-all duration-1000 z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#060309]/60 to-[#060309] z-0" />

      {/* Top Bar (Close and Title) */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest font-semibold border border-white/5">
            Playing from Library
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Now Playing</p>
          <p className="text-sm font-bold truncate max-w-[200px]">{currentSong.title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:scale-105 border border-white/5 transition-all text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main split-view container (CD Art left, Lyrics right) */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-8 md:px-16 gap-12 md:gap-24 overflow-hidden">
        
        {/* Left pane: CD Cover Artwork */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 max-w-sm">
          <div className="relative group">
            {/* Ambient CD shadow */}
            <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-violet-600 to-fuchsia-500 blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse" />
            <img
              src={bgImage}
              alt={currentSong.title}
              className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] border-black/40 object-cover shadow-2xl relative z-10 ${
                isPlaying ? 'animate-spin-slow' : 'paused'
              }`}
            />
            {/* Center vinyl spindle hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#060309] border-4 border-black/30 z-20 shadow-inner" />
          </div>

          <div className="mt-8 text-center relative z-10 w-full">
            <h2 className="text-2xl font-bold truncate tracking-tight">{currentSong.title}</h2>
            <p className="text-base text-violet-300 truncate mt-1">{currentSong.artistName}</p>
            {currentSong.albumName && (
              <p className="text-xs text-white/40 truncate mt-1">Album: {currentSong.albumName}</p>
            )}
          </div>
        </div>

        {/* Right pane: Synced Lyrics */}
        {showLyrics && (
          <div className="w-full md:w-1/2 h-[250px] md:h-[400px] flex flex-col justify-center border border-white/5 rounded-2xl bg-black/25 backdrop-blur-md p-6 overflow-hidden">
            {!songLyrics ? (
              <div className="text-center text-white/40 italic text-sm">
                No lyrics available for this song.
              </div>
            ) : (
              <div
                ref={lyricsContainerRef}
                className="space-y-6 text-center select-none py-20 overflow-y-auto h-full pr-2"
              >
                {songLyrics.map((line, index) => {
                  const isActive = index === activeLine;
                  return (
                    <p
                      key={index}
                      className={`text-sm md:text-base font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-violet-400 scale-105 font-bold opacity-100'
                          : 'text-white/30 opacity-40 hover:opacity-60 scale-100'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Bar: Timeline, volume slider, playback keys and visualizer */}
      <footer className="relative z-10 px-8 py-8 w-full max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Larger Equalizer visualization */}
        <div className="w-full opacity-60">
          <Equalizer barCount={32} />
        </div>

        {/* Timeline Sliders */}
        <div className="w-full flex items-center gap-4 text-xs text-white/50 font-semibold">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-violet-500 outline-none hover:accent-fuchsia-500"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls Console */}
        <div className="flex items-center justify-between">
          {/* Favorites like heart */}
          <div className="w-1/4 flex justify-start">
            {user && (
              <button
                onClick={handleToggleLike}
                className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                  isLiked ? 'text-rose-500 scale-110' : 'text-white/60 hover:text-rose-500'
                }`}
              >
                <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Primary Buttons */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-all rounded-full hover:bg-white/10 ${
                isShuffle ? 'text-violet-400 font-bold scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={prevSong}
              className="p-3 text-white/80 hover:text-white hover:scale-105 transition-all rounded-full hover:bg-white/10"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-linear-to-tr from-violet-600 to-fuchsia-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-violet-500/25 shrink-0"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <button
              onClick={nextSong}
              className="p-3 text-white/80 hover:text-white hover:scale-105 transition-all rounded-full hover:bg-white/10"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 transition-all rounded-full hover:bg-white/10 relative ${
                isRepeat !== 'none' ? 'text-violet-400 font-bold scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
              {isRepeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-violet-500 text-white w-3 h-3 rounded-full flex items-center justify-center scale-90">1</span>
              )}
            </button>
          </div>

          {/* Volume and Lyrics toggle */}
          <div className="w-1/4 flex items-center justify-end gap-4">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-3 rounded-full transition-all ${
                showLyrics ? 'bg-violet-500/25 text-violet-400 border border-violet-500/20' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Lyrics toggle"
            >
              <AlignLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-white/60 hover:text-white transition-all rounded-full hover:bg-white/10"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-white/10 accent-violet-500 outline-none"
              />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default FullscreenPlayer;
