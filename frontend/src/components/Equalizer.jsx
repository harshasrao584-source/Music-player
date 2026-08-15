import React, { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';

const Equalizer = ({ barCount = 15 }) => {
  const { isPlaying } = useContext(AudioContext);

  // Generate bars with random heights and animation delays
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Generate a random height and delay for natural-looking movement
    const height = Math.floor(Math.random() * 20) + 12; // Min 12px, max 32px
    const delay = (i * 0.1).toFixed(1); // stagger delays
    const duration = (0.6 + Math.random() * 0.8).toFixed(2); // stagger durations

    return {
      id: i,
      height,
      delay,
      duration
    };
  });

  return (
    <div className="flex items-end gap-[3px] h-10 px-2 justify-center">
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={`w-[3px] bg-linear-to-t from-violet-400 to-fuchsia-500 rounded-t-full transition-all duration-300 ${
            isPlaying ? 'equalizer-bar-anim' : 'h-[6px]'
          }`}
          style={{
            height: isPlaying ? undefined : '6px',
            animationDelay: isPlaying ? `${bar.delay}s` : undefined,
            animationDuration: isPlaying ? `${bar.duration}s` : undefined,
            transformOrigin: 'bottom'
          }}
        />
      ))}
    </div>
  );
};

export default Equalizer;
