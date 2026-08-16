import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Music, Play, Layers, Trash2, Plus, Disc, Upload, Check } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [songsList, setSongsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Song Form state
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('180'); // default 3 mins
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear().toString());
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    setLoading(true);
    try {
      const statsRes = await axios.get('/admin/stats');
      setStats(statsRes.data);

      const usersRes = await axios.get('/admin/users');
      setUsersList(usersRes.data);

      const songsRes = await axios.get('/songs?limit=100');
      setSongsList(songsRes.data.songs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleUserDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u._id !== userId));
      // Refresh stats
      const statsRes = await axios.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSongDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      await axios.delete(`/admin/songs/${songId}`);
      setSongsList(songsList.filter(s => s._id !== songId));
      // Refresh stats
      const statsRes = await axios.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete song');
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      alert('Audio file is required');
      return;
    }

    setUploading(true);
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artistName', artistName);
    formData.append('albumName', albumName);
    formData.append('genre', genre);
    formData.append('duration', duration);
    formData.append('releaseYear', releaseYear);
    formData.append('audio', audioFile);
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    try {
      await axios.post('/admin/songs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadSuccess('Song uploaded and cataloged successfully!');
      
      // Reset Form fields
      setTitle('');
      setArtistName('');
      setAlbumName('');
      setGenre('');
      setDuration('180');
      setAudioFile(null);
      setCoverFile(null);
      
      // Clear file inputs manually
      document.getElementById('audio-input').value = '';
      const coverInput = document.getElementById('cover-input');
      if (coverInput) coverInput.value = '';

      // Refresh listings
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-xs text-[var(--text-secondary)]">Only administrators can access this area.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-[var(--text-secondary)] animate-pulse">Loading Admin Console...</div>;
  }

  return (
    <div className="space-y-8 text-[var(--text-primary)] select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-violet-400">Admin Control Center</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Upload music catalog, manage system users, and view statistics</p>
      </div>

      {/* Global Application Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-[var(--border-color)]">
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total Users</p>
          <p className="text-xl font-extrabold mt-1">{stats?.totalUsers || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[var(--border-color)]">
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Songs Cataloged</p>
          <p className="text-xl font-extrabold mt-1">{stats?.totalSongs || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[var(--border-color)]">
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Playlists Created</p>
          <p className="text-xl font-extrabold mt-1">{stats?.totalPlaylists || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[var(--border-color)]">
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Total Plays Count</p>
          <p className="text-xl font-extrabold mt-1">{stats?.totalPlays || 0}</p>
        </div>
      </div>

      {/* Upload Song Form */}
      <section className="glass-card rounded-3xl p-6 border border-violet-500/10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload New Track</span>
        </h2>

        {uploadSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAddSong} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Song Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 text-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Artist Name</label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist Name"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Album Name (Optional)</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Album Name"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Genre</label>
                <input
                  type="text"
                  required
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Lofi, Rock, Pop"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Length (Secs)</label>
                <input
                  type="number"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="180"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 text-white"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Audio File (.mp3/.wav)</label>
                <input
                  type="file"
                  id="audio-input"
                  required
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Cover Art (Image)</label>
                <input
                  type="file"
                  id="cover-input"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-bold hover:scale-[1.01] hover:opacity-90 shadow-md shadow-violet-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{uploading ? 'Uploading track files...' : 'Add Song to Catalog'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Lower section: Split (Manage Users left, Manage Songs right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Management */}
        <div className="glass-card rounded-3xl p-5 border border-[var(--border-color)]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {usersList.map((usr) => (
              <div key={usr._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-[var(--border-color)]">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{usr.username}</p>
                  <p className="text-[9px] text-[var(--text-secondary)] truncate">{usr.email}</p>
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-semibold uppercase">{usr.role}</span>
                </div>
                {usr._id !== user._id && (
                  <button
                    onClick={() => handleUserDelete(usr._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-all border border-rose-500/10 shrink-0"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Songs Catalog Management */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 border border-[var(--border-color)]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>Manage Songs ({songsList.length})</span>
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {songsList.map((song) => (
              <div key={song._id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-transparent hover:border-[var(--border-color)]">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.coverUrl || '/uploads/default-cover.png'}
                    alt="cover"
                    className="w-10 h-10 rounded-lg object-cover shadow"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{song.title}</p>
                    <p className="text-[9px] text-[var(--text-secondary)] truncate">{song.artistName} • {song.genre}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">{song.playCount} plays</span>
                  <button
                    onClick={() => handleSongDelete(song._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-all border border-rose-500/10 shrink-0"
                    title="Delete Song"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
