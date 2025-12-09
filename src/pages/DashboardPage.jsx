// src/pages/DashboardPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogOut, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { httpClient, API_BASE } from '../api/httpClient';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await httpClient.get(`${API_BASE}/profile`);
      return data;
    }
  });

  const { data: protectedData, isLoading: dataLoading } = useQuery({
    queryKey: ['protected-data'],
    queryFn: async () => {
      const { data } = await httpClient.get(`${API_BASE}/protected`);
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <nav className="bg-white/20 backdrop-blur-md border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold text-white">SecureApp Pro</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all border border-white/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-purple-100">Hello {user?.name || 'User'}, here's your dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Profile Info</h2>
            </div>
            
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
              </div>
            ) : profile ? (
              <div className="space-y-3">
                {[
                  { label: 'Name', value: profile.name },
                  { label: 'Email', value: profile.email },
                  { label: 'Role', value: profile.role, badge: true },
                  { label: 'Last Login', value: new Date(profile.lastLogin).toLocaleString() }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-gray-600 font-medium">{item.label}:</span>
                    {item.badge ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-gray-900 font-semibold">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Protected Content</h2>
            </div>

            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
              </div>
            ) : protectedData ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">API Response:</p>
                  <p className="text-green-800 font-semibold">{protectedData.message}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Secure Data Items:</p>
                  <ul className="space-y-2">
                    {protectedData.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  ⏰ Fetched: {new Date(protectedData.timestamp).toLocaleString()}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4">
          <p className="text-white text-sm">
            <strong>🔐 JWT Authentication Active:</strong> Access tokens (15min) stored in memory. 
            Refresh tokens (7 days) in localStorage. Auto-refresh on expiry. Try refreshing the page!
          </p>
        </div>
      </div>
    </div>
  );
}
