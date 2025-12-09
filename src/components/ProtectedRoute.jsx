// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
  </div>
);

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) return <LoadingSpinner />;
  return isAuthenticated ? children : <LoginPage />;
}
