import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Play, Trash2, Clock, Music } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';
import { Link } from 'react-router-dom';

const History = () => {
  const { playSong } = useContext(AudioContext);
  const { user } = useContext(AuthContext);

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/history');
      setHistoryItems(res.data);
    } catch (err) {
      console.error('Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your listening history?')) return;
    try {
      await axios.delete('/history');
      setHistoryItems([]);
    } catch (err) {
      console.error('Failed to clear history:', err.message);
    }
  };

  const formatPlayedAt = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <HistoryIcon className="w-12 h-12 text-violet-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Unauthenticated</h2>
        <p className="text-xs text-[var(--text-secondary)]">Please log in to view your listening history.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)] select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-linear-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Listening Profile</span>
            <h1 className="text-2xl font-extrabold tracking-tight">Listening History</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{historyItems.length} tracks recorded</p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-xs font-semibold border border-rose-500/20 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Main List */}
      <div className="glass-card rounded-3xl border border-[var(--border-color)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--text-secondary)]">Loading history...</div>
        ) : historyItems.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Music className="w-10 h-10 text-violet-400 mx-auto" />
            <h3 className="text-sm font-semibold">History is empty</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              You haven't played any tracks yet! Go to the home dashboard to explore.
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-2 rounded-xl bg-violet-600/15 text-violet-400 hover:bg-violet-600 hover:text-white transition-all text-xs font-semibold"
            >
              Start Listening
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                  <th className="py-3 px-6 w-12">#</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Album</th>
                  <th className="py-3 px-6">Played At</th>
                  <th className="py-3 px-6 w-12 text-center"><Clock className="w-4 h-4 mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {historyItems.map((item, index) => {
                  const song = item.song;
                  if (!song) return null;
                  return (
                    <tr
                      key={`${item._id}-${index}`}
                      onClick={() => playSong(song, historyItems.map(h => h.song).filter(Boolean))}
                      className="hover:bg-white/5 group text-sm transition-all cursor-pointer"
                    >
                      {/* Index / Play */}
                      <td className="py-3 px-6 font-semibold text-[var(--text-secondary)]">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="hidden group-hover:block w-4 h-4 fill-current text-violet-400" />
                      </td>

                      {/* Artwork & Info */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={song.coverUrl || '/uploads/default-cover.png'}
                            alt={song.title}
                            className="w-10 h-10 rounded-lg object-cover shadow"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{song.title}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">{song.artistName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Album */}
                      <td className="py-3 px-6 text-[var(--text-secondary)] font-medium">
                        {song.albumName || 'Single'}
                      </td>

                      {/* Played At */}
                      <td className="py-3 px-6 text-xs text-[var(--text-secondary)] font-semibold">
                        {formatPlayedAt(item.playedAt)}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-6 text-center text-xs text-[var(--text-secondary)] font-medium">
                        {formatTime(song.duration)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
