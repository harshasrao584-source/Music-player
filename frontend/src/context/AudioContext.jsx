import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('volume')) || 0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState('none'); // 'none' | 'one' | 'all'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const audioRef = useRef(new Audio());
  const handleSongEndedRef = useRef();

  // Helper to format source URLs
  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path;
  };

  // Configure audio properties on load
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      if (handleSongEndedRef.current) {
        handleSongEndedRef.current();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  // Adjust volume
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
    localStorage.setItem('volume', volume);
  }, [volume, isMuted]);

  // Log track play event to backend
  const logPlayback = async (songId) => {
    try {
      await axios.post(`/songs/${songId}/play`);
    } catch (err) {
      console.error('Failed to log playback stats:', err.message);
    }
  };

  const playSong = (song, newQueue = []) => {
    if (!song) return;

    const audio = audioRef.current;

    // If double clicking same song that is paused, resume
    if (currentSong && currentSong._id === song._id) {
      togglePlay();
      return;
    }

    // Set source
    audio.src = getFullUrl(song.audioUrl);
    audio.load();
    
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);

    // Update queue if provided
    if (newQueue.length > 0) {
      setQueue(newQueue);
      const index = newQueue.findIndex(s => s._id === song._id);
      setQueueIndex(index !== -1 ? index : 0);
    } else {
      // Add to queue if missing
      const existsIdx = queue.findIndex(s => s._id === song._id);
      if (existsIdx !== -1) {
        setQueueIndex(existsIdx);
      } else {
        const updatedQueue = [...queue, song];
        setQueue(updatedQueue);
        setQueueIndex(updatedQueue.length - 1);
      }
    }

    // Attempt playback
    audio.play()
      .then(() => {
        logPlayback(song._id);
      })
      .catch(err => {
        console.error('Audio playback failed:', err.message);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentSong && queue.length > 0) {
      playSong(queue[0]);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Audio playback resume failed:', err.message);
        });
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (isRepeat === 'one' && currentSong) {
      // If repeat-one is on, skip next will play the same song again if triggered automatically,
      // but if manually clicked we might want to go to next. Let's make manual skip go to next.
      nextIndex = queueIndex + 1;
    }

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (isRepeat === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        setProgress(0);
        return; // End of queue
      }
    }

    setQueueIndex(nextIndex);
    const next = queue[nextIndex];
    if (next) {
      playNextTrack(next);
    }
  };

  const prevSong = () => {
    const audio = audioRef.current;
    // Restart if played for more than 3 seconds
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;

    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (prevIndex < 0) {
      if (isRepeat === 'all') {
        prevIndex = queue.length - 1;
      } else {
        audio.currentTime = 0;
        setProgress(0);
        return; // Beginning of queue
      }
    }

    setQueueIndex(prevIndex);
    const prev = queue[prevIndex];
    if (prev) {
      playNextTrack(prev);
    }
  };

  const playNextTrack = (track) => {
    const audio = audioRef.current;
    audio.src = getFullUrl(track.audioUrl);
    audio.load();
    setCurrentSong(track);
    setIsPlaying(true);
    setProgress(0);

    audio.play()
      .then(() => {
        logPlayback(track._id);
      })
      .catch(err => {
        console.error('Audio skip failed:', err.message);
        setIsPlaying(false);
      });
  };

  const handleSongEnded = () => {
    if (isRepeat === 'one') {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play().catch(e => console.error(e));
      setProgress(0);
    } else {
      nextSong();
    }
  };

  handleSongEndedRef.current = handleSongEnded;

  const seekTo = (seconds) => {
    const audio = audioRef.current;
    audio.currentTime = seconds;
    setProgress(seconds);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setRepeatMode();
  };

  const setRepeatMode = () => {
    setIsRepeat((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const addToQueue = (song) => {
    if (!song) return;
    if (queue.some(s => s._id === song._id)) return; // No duplicates in queue list
    setQueue([...queue, song]);
    if (queue.length === 0) {
      setQueueIndex(0);
      setCurrentSong(song);
    }
  };

  const clearQueue = () => {
    audioRef.current.pause();
    setCurrentSong(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setQueue([]);
    setQueueIndex(-1);
  };

  const removeFromQueue = (songId) => {
    const updatedQueue = queue.filter(s => s._id !== songId);
    setQueue(updatedQueue);
    
    if (currentSong && currentSong._id === songId) {
      if (updatedQueue.length > 0) {
        nextSong();
      } else {
        clearQueue();
      }
    } else {
      // Re-map index
      const newIndex = updatedQueue.findIndex(s => s._id === currentSong?._id);
      setQueueIndex(newIndex);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        isMuted,
        progress,
        duration,
        isShuffle,
        isRepeat,
        queue,
        queueIndex,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
