import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  AlignLeft,
  Maximize2
} from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';
import Equalizer from './Equalizer';

const BottomPlayer = ({
  toggleQueue,
  toggleLyrics,
  isQueueOpen,
  isLyricsOpen,
  onFullscreen
}) => {
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

  // Check if current playing song is liked
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !currentSong) {
        setIsLiked(false);
        return;
      }
      try {
        const res = await axios.get(`/favorites/status/${currentSong._id}`);
        setIsLiked(res.data.liked);
      } catch (err) {
        console.error('Failed to load favorite status:', err.message);
      }
    };

    checkLikeStatus();
  }, [currentSong, user]);

  const handleToggleLike = async () => {
    if (!user) {
      alert('Please log in to like songs!');
      return;
    }
    if (!currentSong) return;

    try {
      const res = await axios.post(`/favorites/toggle/${currentSong._id}`);
      setIsLiked(res.data.liked);
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
    }
  };

  const handleSeekChange = (e) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  // Keyboard shortcut controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space bar toggles play/pause if not typing in input
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  if (!currentSong) {
    return (
      <div className="h-20 glass-effect border-t border-[var(--border-color)] flex items-center justify-center text-xs text-[var(--text-secondary)] py-4 select-none px-6">
        <span>No track selected. Choose a song to start listening.</span>
      </div>
    );
  }

  return (
    <div className="h-24 glass-effect border-t border-[var(--border-color)] flex items-center justify-between px-6 py-3 select-none">
      
      <div className="flex items-center gap-3 w-1/3 min-w-0">
        <img
          src={currentSong.coverUrl || '/uploads/default-cover.png'}
          alt={currentSong.title}
          className={`w-14 h-14 rounded-lg object-cover shadow-lg ${isPlaying ? 'animate-spin-slow' : 'paused'}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{currentSong.title}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{currentSong.artistName}</p>
        </div>
        
        {/* Like Heart Button */}
        {user && (
          <button
            onClick={handleToggleLike}
            className={`p-2 rounded-full hover:bg-white/10 transition-all ${
              isLiked ? 'text-rose-500 scale-110' : 'text-[var(--text-secondary)] hover:text-rose-500'
            }`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Small Equalizer Bounce */}
        <div className="hidden lg:block">
          <Equalizer barCount={6} />
        </div>
      </div>

      {/* Middle Section: Player Controls and Timeline Slider */}
      <div className="flex flex-col items-center w-1/3 max-w-xl">
        {/* Playback Buttons */}
        <div className="flex items-center gap-5 mb-2">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-all rounded-full hover:bg-white/5 ${
              isShuffle ? 'text-violet-400 font-bold scale-110' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button
            onClick={prevSong}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105 transition-all rounded-full hover:bg-white/5"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-linear-to-tr from-violet-600 to-fuchsia-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-md shadow-violet-500/20 shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextSong}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105 transition-all rounded-full hover:bg-white/5"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 transition-all rounded-full hover:bg-white/5 relative ${
              isRepeat !== 'none' ? 'text-violet-400 font-bold scale-110' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={`Repeat Mode: ${isRepeat}`}
          >
            <Repeat className="w-4 h-4" />
            {isRepeat === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] bg-violet-500 text-white w-3 h-3 rounded-full flex items-center justify-center scale-90">1</span>
            )}
          </button>
        </div>

        {/* Timeline Sliders */}
        <div className="w-full flex items-center gap-3 text-[10px] text-[var(--text-secondary)] font-medium">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeekChange}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-violet-500 outline-none hover:accent-fuchsia-500"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Section: Volume & Panels Switches */}
      <div className="flex items-center justify-end gap-4 w-1/3">
        {/* Toggle Lyrics */}
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-xl transition-all ${
            isLyricsOpen
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          }`}
          title="Toggle Lyrics"
        >
          <AlignLeft className="w-4.5 h-4.5" />
        </button>

        {/* Toggle Queue */}
        <button
          onClick={toggleQueue}
          className={`p-2 rounded-xl transition-all ${
            isQueueOpen
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          }`}
          title="Toggle Play Queue"
        >
          <ListMusic className="w-4.5 h-4.5" />
        </button>

        {/* Volume Level Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all rounded-full hover:bg-white/5"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-violet-500 outline-none hover:accent-fuchsia-500"
          />
        </div>

        {/* Maximize Button for Fullscreen view */}
        <button
          onClick={onFullscreen}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all shrink-0"
          title="Fullscreen Mode"
        >
          <Maximize2 className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
};

export default BottomPlayer;
