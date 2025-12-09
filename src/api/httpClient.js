// src/api/httpClient.js
import { mockAPI } from './mockApi';

export const API_BASE = 'https://api.example.com';

class HttpClient {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      error ? prom.reject(error) : prom.resolve(token);
    });
    this.failedQueue = [];
  }

  async request(config) {
    const { method = 'GET', url, data, requiresAuth = true } = config;

    if (requiresAuth && this.accessToken) {
      config.headers = { ...config.headers, Authorization: `Bearer ${this.accessToken}` };
    }

    try {
      let response;
      
      if (url.includes('/login')) {
        response = await mockAPI.login(data);
      } else if (url.includes('/refresh')) {
        response = await mockAPI.refresh(this.refreshToken);
      } else if (url.includes('/profile')) {
        response = await mockAPI.getProfile(this.accessToken);
      } else if (url.includes('/protected')) {
        response = await mockAPI.getProtectedData(this.accessToken);
      }

      return { data: response };
    } catch (error) {
      if (error.message === 'Unauthorized' && requiresAuth && !url.includes('/refresh')) {
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            config.headers.Authorization = `Bearer ${token}`;
            return this.request(config);
          });
        }

        this.isRefreshing = true;

        try {
          const { data } = await this.request({
            method: 'POST',
            url: `${API_BASE}/refresh`,
            requiresAuth: false
          });

          this.setTokens(data.accessToken, data.refreshToken);
          this.processQueue(null, data.accessToken);
          
          config.headers.Authorization = `Bearer ${data.accessToken}`;
          return this.request(config);
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          this.clearTokens();
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }
      throw error;
    }
  }

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }
}

export const httpClient = new HttpClient();
