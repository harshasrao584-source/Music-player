import React, { useContext } from 'react';
import { Trash2, Play, Volume2, X } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';

const QueuePanel = ({ isOpen, onClose }) => {
  const { queue, currentSong, queueIndex, playSong, removeFromQueue, clearQueue } = useContext(AudioContext);

  if (!isOpen) return null;

  return (
    <div className="w-80 glass-effect border-l border-[var(--border-color)] flex flex-col h-full text-[var(--text-primary)] z-40 transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400">Play Queue</h2>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1 text-xs text-rose-400 hover:text-rose-600 transition-all flex items-center gap-1"
              title="Clear Queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-[var(--text-secondary)]">
            <p>Queue is empty</p>
            <p className="mt-1">Add tracks from search or playlists.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((song, index) => {
              const isCurrent = currentSong && currentSong._id === song._id && queueIndex === index;
              return (
                <div
                  key={`${song._id}-${index}`}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-violet-600/10 border-violet-500/30'
                      : 'bg-white/5 border-transparent hover:border-[var(--border-color)]'
                  }`}
                >
                  <img
                    src={song.coverUrl || '/uploads/default-cover.png'}
                    alt={song.title}
                    className="w-10 h-10 rounded-lg object-cover shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-violet-400' : 'text-[var(--text-primary)]'}`}>
                      {song.title}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">{song.artistName}</p>
                  </div>
                  
                  {isCurrent ? (
                    <Volume2 className="w-4 h-4 text-violet-400 animate-bounce shrink-0" />
                  ) : (
                    <button
                      onClick={() => playSong(song, queue)}
                      className="p-1 text-[var(--text-secondary)] hover:text-violet-400 transition-all shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFromQueue(song._id)}
                    className="p-1 text-[var(--text-secondary)] hover:text-rose-400 transition-all shrink-0"
                    title="Remove from queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
