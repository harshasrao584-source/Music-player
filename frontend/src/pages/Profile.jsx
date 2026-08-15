import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { AudioContext } from '../context/AudioContext';
import { User, Shield, Key, Sun, Moon, Keyboard, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserAvatar } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { clearQueue } = useContext(AudioContext);

  const [avatarSeed, setAvatarSeed] = useState(user?.username || 'melody');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRandomizeAvatar = async () => {
    const seeds = ['wave', 'sound', 'tempo', 'beat', 'remix', 'echo', 'tune', 'jazz', 'synth', 'retro'];
    const newSeed = seeds[Math.floor(Math.random() * seeds.length)] + '-' + Math.floor(Math.random() * 1000);
    setAvatarSeed(newSeed);

    const newAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${newSeed}`;
    
    // In a full implementation we could save to backend. Let's update state avatar locally for the session.
    updateUserAvatar(newAvatarUrl);
    setSuccessMsg('Avatar updated! Save changes in database is simulated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  const handleClearPlayHistory = async () => {
    if (!confirm('Are you sure you want to clear your listening history?')) return;
    try {
      await axios.delete('/history');
      alert('History cleared successfully!');
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <User className="w-12 h-12 text-violet-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Unauthenticated</h2>
        <p className="text-xs text-[var(--text-secondary)]">Please log in to view your profile and system settings.</p>
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
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account & Settings</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Manage your listening profile, system theme, and player keybinds</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Profile detail left, Settings right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 border border-[var(--border-color)] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
          
          <img
            src={getFullAvatarUrl(user.avatar)}
            alt="user avatar"
            className="w-24 h-24 rounded-full border-4 border-violet-500/20 object-cover shadow-lg mb-4"
          />

          <h2 className="text-lg font-bold tracking-tight">{user.username}</h2>
          <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>{user.role} Account</span>
          </div>

          <button
            onClick={handleRandomizeAvatar}
            className="mt-6 px-4 py-2 rounded-xl bg-white/5 border border-[var(--border-color)] hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
          >
            Randomize Avatar
          </button>
        </div>

        {/* System Settings panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preferences */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-color)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">System Preferences</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
              <div>
                <p className="text-xs font-bold">Interface Theme</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Toggle between dark night mode and clean light mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400 font-semibold text-xs border border-violet-500/15"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
              <div>
                <p className="text-xs font-bold">Wipe Play History</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Erase your complete listening logs from our database</p>
              </div>
              <button
                onClick={handleClearPlayHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-xs border border-rose-500/15 hover:bg-rose-500 hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete History</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold">Reset Music Queue</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Stop playback and clear all songs in the queue</p>
              </div>
              <button
                onClick={() => {
                  clearQueue();
                  alert('Queue cleared successfully!');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[var(--border-color)] hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
              >
                <span>Reset Queue</span>
              </button>
            </div>
          </div>

          {/* Keyboard Keybinds */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-color)] space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Controls Guide</span>
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Use these global hotkeys anywhere in the application to control playback. (Make sure you are not typing in a search or form input field).
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-[var(--border-color)]">
                <span className="font-semibold text-[var(--text-secondary)]">Play / Pause</span>
                <kbd className="px-2 py-1 bg-violet-600 text-white rounded-md text-[9px] font-bold shadow">SPACE</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-[var(--border-color)]">
                <span className="font-semibold text-[var(--text-secondary)]">Volume Mute</span>
                <kbd className="px-2 py-1 bg-violet-600 text-white rounded-md text-[9px] font-bold shadow">M key</kbd>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
