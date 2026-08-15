import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Play, Plus, Clock, ListMusic, PlusCircle, Check } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/format';

const Search = () => {
  const { playSong, addToQueue } = useContext(AudioContext);
  const { user } = useContext(AuthContext);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // track which song's playlist-dropdown is open
  const [notification, setNotification] = useState('');

  const fetchResults = async (searchVal) => {
    setLoading(true);
    try {
      const res = await axios.get(`/songs?search=${searchVal}`);
      setResults(res.data.songs || []);
    } catch (err) {
      console.error('Failed to search songs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/playlists');
      setPlaylists(res.data);
    } catch (err) {
      console.error('Failed to load playlists:', err.message);
    }
  };

  useEffect(() => {
    fetchResults('');
    fetchPlaylists();
  }, [user]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchResults(val);
  };

  const handleAddToPlaylist = async (playlistId, songId) => {
    try {
      await axios.post(`/playlists/${playlistId}/songs`, { songId });
      showNotification('Song added to playlist successfully!');
      setActiveDropdown(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add song to playlist');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)] select-none">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Catalog</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Search through tracks, artists, albums, or genres</p>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-500/20 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Input Widget */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="What do you want to listen to?"
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-hidden focus:border-violet-500 text-sm focus:bg-white/10 dark:focus:bg-black/20 transition-all font-medium"
        />
      </div>

      {/* Results Listing */}
      <div className="glass-card rounded-3xl overflow-hidden border border-[var(--border-color)]">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-white/5 dark:bg-black/10">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Search Results</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{results.length} songs found</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">Searching...</div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-secondary)]">No songs found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                  <th className="py-3 px-6 w-12">#</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Album</th>
                  <th className="py-3 px-6">Genre</th>
                  <th className="py-3 px-6 w-12 text-center"><Clock className="w-4 h-4 mx-auto" /></th>
                  <th className="py-3 px-6 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {results.map((song, index) => (
                  <tr
                    key={song._id}
                    className="hover:bg-white/5 group text-sm transition-all"
                  >
                    {/* Index / Play */}
                    <td className="py-3 px-6 font-semibold text-[var(--text-secondary)]">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button
                        onClick={() => playSong(song, results)}
                        className="hidden group-hover:flex text-violet-400 hover:scale-110 transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
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

                    {/* Genre */}
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/10 uppercase tracking-wider">
                        {song.genre}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-6 text-center text-xs text-[var(--text-secondary)] font-medium">
                      {formatTime(song.duration)}
                    </td>

                    {/* Action Links */}
                    <td className="py-3 px-6 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        {/* Add to Queue */}
                        <button
                          onClick={() => {
                            addToQueue(song);
                            showNotification('Added to play queue!');
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-violet-600 hover:text-white transition-all text-[var(--text-secondary)]"
                          title="Add to Play Queue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* Add to Playlist dropdown */}
                        {user && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === song._id ? null : song._id)}
                              className={`p-2 rounded-lg bg-white/5 transition-all text-[var(--text-secondary)] ${
                                activeDropdown === song._id ? 'bg-violet-600 text-white' : 'hover:bg-violet-600 hover:text-white'
                              }`}
                              title="Add to Playlist"
                            >
                              <ListMusic className="w-4 h-4" />
                            </button>

                            {activeDropdown === song._id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] shadow-xl z-50 text-left p-1">
                                <span className="block text-[9px] font-bold text-violet-400 uppercase tracking-widest px-3 py-1.5 border-b border-[var(--border-color)] mb-1">
                                  Add to Playlist
                                </span>
                                <div className="max-h-36 overflow-y-auto space-y-0.5">
                                  {playlists.map((pl) => (
                                    <button
                                      key={pl._id}
                                      onClick={() => handleAddToPlaylist(pl._id, song._id)}
                                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-violet-500/10 hover:text-violet-400 transition-all truncate"
                                    >
                                      {pl.name}
                                    </button>
                                  ))}
                                  {playlists.length === 0 && (
                                    <span className="block text-[10px] text-[var(--text-secondary)] px-3 py-2 italic text-center">No playlists found</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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

export default Search;
