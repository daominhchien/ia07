// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { httpClient, API_BASE } from '../api/httpClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      httpClient.refreshToken = refreshToken;
      initializeAuth();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      const { data } = await httpClient.post(`${API_BASE}/refresh`);
      httpClient.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      const profile = await httpClient.get(`${API_BASE}/profile`);
      setUser(profile.data);
    } catch (error) {
      localStorage.removeItem('refreshToken');
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (credentials) => {
    const { data } = await httpClient.post(`${API_BASE}/login`, credentials, { requiresAuth: false });
    httpClient.setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    httpClient.clearTokens();
    localStorage.removeItem('refreshToken');
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
