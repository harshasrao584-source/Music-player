import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set base backend URL
export const API_BASE = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set auth header helper
  const setAuthHeader = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setAuthHeader(storedToken);
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile:', error.response?.data?.message || error.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setAuthHeader(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await axios.post('/auth/register', { username, email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setAuthHeader(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setAuthHeader(null);
    setUser(null);
  };

  const updateUserAvatar = (avatarUrl) => {
    if (user) {
      setUser({ ...user, avatar: avatarUrl });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};
