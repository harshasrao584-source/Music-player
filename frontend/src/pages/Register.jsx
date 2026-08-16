import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Music, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] px-4 font-outfit relative">
      {/* Abstract background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-fuchsia-600/10 blur-3xl z-0" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-[var(--border-color)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <img src="/logo.jpg" alt="MelodyAI Logo" className="w-full h-full object-cover animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create your account</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Join MelodyAI to personalize your listening profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose a username"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 dark:focus:bg-black/20 text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@melodyai.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 dark:focus:bg-black/20 text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-[var(--border-color)] outline-hidden text-sm focus:border-violet-500 focus:bg-white/10 dark:focus:bg-black/20 text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-500 font-semibold underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
