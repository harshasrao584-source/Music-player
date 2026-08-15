import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Heart, Play, Trash2, Clock, Music } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { playSong } = useContext(AudioContext);
  const { user } = useContext(AuthContext);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/favorites');
      setSongs(res.data);
    } catch (err) {
      console.error('Failed to load favorites:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (e, songId) => {
    e.stopPropagation(); // prevent playing song when clicking unlike
    try {
      await axios.post(`/favorites/toggle/${songId}`);
      // Remove from state list
      setSongs(songs.filter(s => s._id !== songId));
    } catch (err) {
      console.error('Failed to remove favorite:', err.message);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Unauthenticated</h2>
        <p className="text-xs text-[var(--text-secondary)]">Please log in to view your Liked Songs library.</p>
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
      <div className="flex items-center gap-5 p-6 rounded-3xl bg-linear-to-r from-rose-500/10 to-violet-500/10 border border-rose-500/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-rose-500/5 blur-2xl" />
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Heart className="w-8 h-8 text-white fill-current" />
        </div>
        <div>
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Library</span>
          <h1 className="text-2xl font-extrabold tracking-tight">Liked Songs</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{songs.length} favorite tracks saved</p>
        </div>
      </div>

      {/* Main List */}
      <div className="glass-card rounded-3xl border border-[var(--border-color)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--text-secondary)]">Loading favorites...</div>
        ) : songs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Music className="w-10 h-10 text-violet-400 mx-auto" />
            <h3 className="text-sm font-semibold">No liked songs yet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              Your liked songs will show up here. Go to the search catalog to find tracks.
            </p>
            <Link
              to="/search"
              className="inline-block px-5 py-2 rounded-xl bg-violet-600/15 text-violet-400 hover:bg-violet-600 hover:text-white transition-all text-xs font-semibold"
            >
              Browse Music
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
                  <th className="py-3 px-6 w-12 text-center"><Clock className="w-4 h-4 mx-auto" /></th>
                  <th className="py-3 px-6 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {songs.map((song, index) => (
                  <tr
                    key={song._id}
                    onClick={() => playSong(song, songs)}
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
                          src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : '/uploads/default-cover.png'}
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

                    {/* Duration */}
                    <td className="py-3 px-6 text-center text-xs text-[var(--text-secondary)] font-medium">
                      {formatTime(song.duration)}
                    </td>

                    {/* Unlike Button */}
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={(e) => handleRemoveFavorite(e, song._id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-600 hover:text-white text-rose-400 transition-all shadow-sm shrink-0"
                        title="Unlike"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
