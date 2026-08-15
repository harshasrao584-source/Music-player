import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FolderHeart, Play, Trash2, ArrowUp, ArrowDown, Edit3, Lock, Globe, Music } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useContext(AudioContext);
  const { user } = useContext(AuthContext);

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/playlists/${id}`);
      setPlaylist(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load playlist details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handlePlayPlaylist = () => {
    if (!playlist || playlist.songs.length === 0) return;
    playSong(playlist.songs[0], playlist.songs);
  };

  const handleRenamePlaylist = async () => {
    const newName = prompt('Rename Playlist to:', playlist.name);
    if (!newName || newName.trim() === playlist.name) return;

    try {
      const res = await axios.put(`/playlists/${id}`, { name: newName });
      setPlaylist({ ...playlist, name: res.data.name });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename');
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const res = await axios.put(`/playlists/${id}`, { isPrivate: !playlist.isPrivate });
      setPlaylist({ ...playlist, isPrivate: res.data.isPrivate });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle privacy');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await axios.delete(`/playlists/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete playlist');
    }
  };

  const handleRemoveSong = async (e, songId) => {
    e.stopPropagation();
    try {
      await axios.delete(`/playlists/${id}/songs/${songId}`);
      // Refresh local view
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter(s => s._id !== songId)
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove song');
    }
  };

  // Reordering: swap song locations and send order update to backend
  const moveSong = async (index, direction) => {
    const newSongs = [...playlist.songs];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= newSongs.length) return;

    // Swap elements
    const temp = newSongs[index];
    newSongs[index] = newSongs[targetIdx];
    newSongs[targetIdx] = temp;

    // Update state first for instant response
    setPlaylist({ ...playlist, songs: newSongs });

    try {
      const songIds = newSongs.map(s => s._id);
      await axios.put(`/playlists/${id}/reorder`, { songs: songIds });
    } catch (err) {
      console.error('Failed to save track order:', err.message);
      // Revert if API failed
      fetchPlaylist();
    }
  };

  const isOwner = user && playlist && playlist.user?._id === user._id;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white/5 w-full rounded-3xl" />
        <div className="h-64 bg-white/5 w-full rounded-3xl" />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="space-y-6 text-[var(--text-primary)] select-none">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-linear-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-violet-500/5 blur-2xl" />
        
        {/* Playlist Cover Art */}
        <div className="w-32 h-32 rounded-2xl bg-linear-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/20 shrink-0">
          <FolderHeart className="w-16 h-16 text-white" />
        </div>

        {/* Playlist Details */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Playlist</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border flex items-center gap-1 ${
              playlist.isPrivate ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
            }`}>
              {playlist.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
              <span>{playlist.isPrivate ? 'Private' : 'Public'}</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">{playlist.name}</h1>
          <p className="text-xs text-[var(--text-secondary)]">{playlist.description || 'No description provided.'}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Created by <span className="font-semibold">{playlist.user?.username || 'Unknown'}</span> • {playlist.songs.length} songs</p>
        </div>

        {/* Header Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          {playlist.songs.length > 0 && (
            <button
              onClick={handlePlayPlaylist}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-semibold hover:scale-105 transition-all shadow-md shadow-violet-500/25"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Playlist</span>
            </button>
          )}

          {isOwner && (
            <div className="flex items-center gap-1 bg-white/5 dark:bg-black/20 rounded-xl p-1 border border-[var(--border-color)]">
              <button
                onClick={handleRenamePlaylist}
                className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-all"
                title="Rename Playlist"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleTogglePrivacy}
                className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-all"
                title={playlist.isPrivate ? 'Make Public' : 'Make Private'}
              >
                {playlist.isPrivate ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDeletePlaylist}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-white transition-all"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tracks List */}
      <div className="glass-card rounded-3xl border border-[var(--border-color)] overflow-hidden">
        {playlist.songs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Music className="w-10 h-10 text-violet-400 mx-auto" />
            <h3 className="text-sm font-semibold">Playlist is empty</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              Add songs from the search tab or explore the home catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                  <th className="py-3 px-6 w-12">#</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Album</th>
                  <th className="py-3 px-6 w-12 text-center">Length</th>
                  {isOwner && <th className="py-3 px-6 w-44 text-right">Arrange</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {playlist.songs.map((song, index) => (
                  <tr
                    key={song._id}
                    onClick={() => playSong(song, playlist.songs)}
                    className="hover:bg-white/5 group text-sm transition-all cursor-pointer"
                  >
                    {/* Index / Play */}
                    <td className="py-3 px-6 font-semibold text-[var(--text-secondary)]">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="hidden group-hover:block w-4 h-4 fill-current text-violet-400" />
                    </td>

                    {/* Info */}
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

                    {/* Ownership Reordering & Removal */}
                    {isOwner && (
                      <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Arrange Up */}
                          <button
                            onClick={() => moveSong(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Arrange Down */}
                          <button
                            onClick={() => moveSong(index, 'down')}
                            disabled={index === playlist.songs.length - 1}
                            className="p-1.5 rounded-lg bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete from Playlist */}
                          <button
                            onClick={(e) => handleRemoveSong(e, song._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-all border border-rose-500/10"
                            title="Remove from Playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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

export default PlaylistDetail;
