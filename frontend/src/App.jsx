import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Stats from './pages/Stats';
import PlaylistDetail from './pages/PlaylistDetail';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08050e] text-violet-400 font-semibold animate-pulse text-sm">
        Authenticating session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08050e] text-violet-400 font-semibold animate-pulse text-sm">
        Authenticating admin session...
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <Routes>
              {/* Standalone Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main Layout Pages */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <MainLayout>
                    <Search />
                  </MainLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                }
              />
              <Route
                path="/playlist/:id"
                element={
                  <MainLayout>
                    <PlaylistDetail />
                  </MainLayout>
                }
              />

              {/* Protected Library Pages */}
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Favorites />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <History />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Stats />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Administrative Dashboard */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <MainLayout>
                      <AdminDashboard />
                    </MainLayout>
                  </AdminRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
