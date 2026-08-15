import React, { useContext, useEffect, useState, useRef } from 'react';
import { Music, X } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';

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

const LyricsPanel = ({ isOpen, onClose }) => {
  const { currentSong, progress } = useContext(AudioContext);
  const [activeLine, setActiveLine] = useState(-1);
  const containerRef = useRef(null);

  const songLyrics = currentSong ? lyricsData[currentSong.title] : null;

  // Track active line based on current playtime progress
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

  // Auto-scroll active line into center of panel
  useEffect(() => {
    if (activeLine !== -1 && containerRef.current) {
      const activeEl = containerRef.current.children[activeLine];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLine]);

  if (!isOpen) return null;

  return (
    <div className="w-80 glass-effect border-l border-[var(--border-color)] flex flex-col h-full text-[var(--text-primary)] z-40 transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400">Dynamic Lyrics</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
        {!currentSong ? (
          <div className="flex flex-col items-center justify-center text-center text-xs text-[var(--text-secondary)]">
            <Music className="w-8 h-8 text-violet-400 mb-2 animate-bounce" />
            <p>No track is playing</p>
          </div>
        ) : !songLyrics ? (
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-violet-400">🎵 {currentSong.title} 🎵</p>
            <p className="text-xs text-[var(--text-secondary)] italic">
              [Instrumental or dynamic lyrics are not available for this track]
            </p>
            <div className="text-xs text-white/40 p-4 border border-dashed border-white/10 rounded-xl bg-white/5">
              Lyrics are automatically mapped for our seed tracks. Uploaded tracks show placeholder.
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="space-y-6 text-center select-none py-12"
          >
            {songLyrics.map((line, index) => {
              const isActive = index === activeLine;
              return (
                <p
                  key={index}
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-violet-400 scale-110 font-bold opacity-100 filter drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]'
                      : 'text-[var(--text-secondary)] opacity-40 hover:opacity-60 scale-100'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsPanel;
