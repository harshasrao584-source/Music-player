import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart2, Clock, Music, Disc, Layers, Trophy } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Stats = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load statistics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const formatListenTime = (totalSecs) => {
    if (!totalSecs) return '0 hrs';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs === 0) return `${mins} mins`;
    return `${hrs}h ${mins}m`;
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <BarChart2 className="w-12 h-12 text-violet-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Unauthenticated</h2>
        <p className="text-xs text-[var(--text-secondary)]">Please log in to view your listening statistics dashboard.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 w-1/4 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-80 bg-white/5 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)] select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Listening Statistics</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Deep analytics on your musical taste and activity trends</p>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Played */}
        <div className="glass-card rounded-3xl p-5 border border-[var(--border-color)] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-violet-500/5 rounded-full blur-xl" />
          <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Tracks Played</p>
            <p className="text-2xl font-extrabold mt-1">{stats?.totalSongsPlayed || 0}</p>
          </div>
        </div>

        {/* Total Time */}
        <div className="glass-card rounded-3xl p-5 border border-[var(--border-color)] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-xl" />
          <div className="p-3 bg-fuchsia-500/10 rounded-2xl text-fuchsia-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Listening Time</p>
            <p className="text-2xl font-extrabold mt-1">{formatListenTime(stats?.totalListeningTime)}</p>
          </div>
        </div>

        {/* Favorite Genre */}
        <div className="glass-card rounded-3xl p-5 border border-[var(--border-color)] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl" />
          <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Favorite Genre</p>
            <p className="text-lg font-bold truncate max-w-[120px] mt-1.5">{stats?.favoriteGenre || 'N/A'}</p>
          </div>
        </div>

        {/* Top Artist */}
        <div className="glass-card rounded-3xl p-5 border border-[var(--border-color)] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Top Artist</p>
            <p className="text-lg font-bold truncate max-w-[120px] mt-1.5">{stats?.mostPlayedArtist || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Top Song and Activity Section split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Listening activity graph */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[var(--border-color)]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4">Daily Activity Logs</h2>
          <div className="h-64">
            {stats?.weeklyActivity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="playsGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,10,25,0.85)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px'
                    }}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold', color: '#a78bfa' }}
                    itemStyle={{ fontSize: 10, color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="plays" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#playsGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[var(--text-secondary)]">
                No activity records available. Play songs to generate logs.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Showcase Cards */}
        <div className="glass-card rounded-3xl p-6 border border-[var(--border-color)] flex flex-col justify-center gap-4 relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-36 h-36 bg-fuchsia-500/5 rounded-full blur-2xl" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-2">Taste Highlights</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 shrink-0">
                <Disc className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Most Listened Song</p>
                <p className="text-sm font-bold truncate text-[var(--text-primary)] mt-0.5">{stats?.mostPlayedSong || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-600/10 flex items-center justify-center text-fuchsia-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Most Listened Artist</p>
                <p className="text-sm font-bold truncate text-[var(--text-primary)] mt-0.5">{stats?.mostPlayedArtist || 'N/A'}</p>
              </div>
            </div>
            
            <div className="p-4 border border-dashed border-[var(--border-color)] rounded-2xl bg-white/5 text-[10px] text-[var(--text-secondary)] leading-relaxed">
              📈 Statistics are updated continuously in the backend. As you listen, your Taste Highlights and Daily Activity graphs adjust.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Stats;
