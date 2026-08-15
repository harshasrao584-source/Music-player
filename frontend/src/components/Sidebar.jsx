import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Search,
  Library,
  Heart,
  History,
  BarChart2,
  Lock,
  Plus,
  Music,
  LogOut,
  Sun,
  Moon,
  FolderHeart
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { AudioContext } from '../context/AudioContext';

const Sidebar = ({ onCreatePlaylistSuccess }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { playSong } = useContext(AudioContext);
  const [playlists, setPlaylists] = useState([]);

  // Fetch playlists to show in sidebar
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
    fetchPlaylists();
  }, [user, location.pathname]);

  // Create playlist from sidebar
  const handleCreatePlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;
    try {
      await axios.post('/playlists', { name, description: 'Created from sidebar' });
      fetchPlaylists();
      if (onCreatePlaylistSuccess) onCreatePlaylistSuccess();
    } catch (err) {
      alert('Error creating playlist: ' + (err.response?.data?.message || err.message));
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Favorites', path: '/favorites', icon: Heart, protected: true },
    { name: 'Recently Played', path: '/history', icon: History, protected: true },
    { name: 'Statistics', path: '/stats', icon: BarChart2, protected: true }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: Lock });
  }

  const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return 'https://api.dicebear.com/7.x/adventurer/svg?seed=melody';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  return (
    <aside className="w-64 glass-effect border-r border-[var(--border-color)] flex flex-col h-full text-[var(--text-primary)]">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Music className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-outfit">
            MelodyAI
          </h1>
          <span className="text-[10px] text-violet-400 uppercase tracking-widest font-semibold">Smart Player</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/10'
                    : 'text-[var(--text-secondary)] hover:bg-white/10 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-violet-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Playlists Section */}
        {user && (
          <div className="pt-6">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Playlists</span>
              <button
                onClick={handleCreatePlaylist}
                className="p-1 rounded-md hover:bg-white/10 text-violet-400 hover:text-[var(--text-primary)] transition-all"
                title="Create Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {playlists.map((pl) => (
                <Link
                  key={pl._id}
                  to={`/playlist/${pl._id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    location.pathname === `/playlist/${pl._id}`
                      ? 'bg-violet-500/20 text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FolderHeart className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </Link>
              ))}
              {playlists.length === 0 && (
                <p className="text-center text-[10px] text-[var(--text-secondary)] py-2">No playlists yet</p>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[var(--border-color)] bg-white/5 dark:bg-black/10 flex flex-col gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <img
              src={getFullAvatarUrl(user.avatar)}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-violet-500/20 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{user.username}</p>
              <p className="text-[10px] text-violet-400 capitalize">{user.role}</p>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full text-center py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white font-medium text-sm hover:opacity-90 transition-all shadow-md shadow-violet-500/10"
          >
            Login / Signup
          </Link>
        )}

        {/* Actions bar (Theme and Logout) */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-white/10 text-violet-400 hover:text-[var(--text-primary)] transition-all border border-[var(--border-color)]"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all border border-rose-500/20"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
