// src/api/mockApi.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers = [
  { email: 'demo@example.com', password: 'password123', name: 'Demo User', role: 'user' },
  { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' }
];

const generateToken = (payload, expiresIn = '15m') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const expTime = expiresIn === '15m' ? 900000 : 604800000;
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + expTime }));
  return `${header}.${body}.mock_sig_${Date.now()}`;
};

const verifyToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

export const mockAPI = {
  login: async ({ email, password }) => {
    await delay(800);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    
    return {
      accessToken: generateToken({ email: user.email, role: user.role }, '15m'),
      refreshToken: generateToken({ email: user.email }, '7d'),
      user: { email: user.email, name: user.name, role: user.role }
    };
  },

  refresh: async (refreshToken) => {
    await delay(500);
    const payload = verifyToken(refreshToken);
    if (!payload) throw new Error('Invalid refresh token');
    
    const user = mockUsers.find(u => u.email === payload.email);
    return {
      accessToken: generateToken({ email: user.email, role: user.role }, '15m'),
      refreshToken
    };
  },

  getProfile: async (token) => {
    await delay(400);
    const payload = verifyToken(token);
    if (!payload) throw new Error('Unauthorized');
    
    const user = mockUsers.find(u => u.email === payload.email);
    return {
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: new Date().toISOString()
    };
  },

  getProtectedData: async (token) => {
    await delay(600);
    const payload = verifyToken(token);
    if (!payload) throw new Error('Unauthorized');
    
    return {
      message: 'Successfully fetched protected data!',
      timestamp: new Date().toISOString(),
      items: ['Secure Item 1', 'Secure Item 2', 'Secure Item 3', 'Secure Item 4']
    };
  }
};
