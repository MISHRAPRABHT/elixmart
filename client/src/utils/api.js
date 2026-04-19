import axios from 'axios';
import toast from 'react-hot-toast';
import { getAccessToken, setAccessToken, clearAccessToken } from './authToken';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Separate client used only for refresh to avoid interceptor loops
const RefreshAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth endpoints that should NEVER trigger session-expiry logic
const AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/refresh', '/auth/logout'];

const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some(ep => url?.includes(ep));

// Prevent multiple simultaneous force-logouts
let isLoggingOut = false;

// Helper to force logout and redirect to login
const forceLogout = (message) => {
  if (isLoggingOut) return;          // already handling it
  if (!getAccessToken()) return;     // not logged in, nothing to expire
  isLoggingOut = true;
  clearAccessToken();
  toast.error(message || 'Session expired. Please login again.');
  setTimeout(() => {
    isLoggingOut = false;
    window.location.href = '/login';
  }, 800);
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Never intercept errors from auth endpoints (login, signup, etc.)
    if (isAuthEndpoint(original?.url)) {
      return Promise.reject(error);
    }

    // Attempt refresh on expired access token once per request
    if (status === 401 && code === 'ACCESS_TOKEN_EXPIRED' && original && !original._retry) {
      original._retry = true;
      try {
        const refreshRes = await RefreshAPI.post('/auth/refresh');
        const nextToken = refreshRes.data?.token;
        if (!nextToken) throw new Error('Refresh did not return token');
        setAccessToken(nextToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${nextToken}`;
        return API(original);
      } catch (refreshErr) {
        forceLogout('Session expired due to inactivity. Please login again.');
        return Promise.reject(refreshErr);
      }
    }

    // If refresh token is invalid/expired, force logout with message
    if (status === 401 && (code === 'INACTIVITY_EXPIRED' || code === 'NO_REFRESH_TOKEN' || code === 'INVALID_REFRESH_TOKEN')) {
      forceLogout(
        code === 'INACTIVITY_EXPIRED'
          ? 'Session expired due to inactivity. Please login again.'
          : 'Session expired. Please login again.'
      );
    }

    // Generic 401 (no token, user not found, etc.) — force logout only if user was logged in
    if (status === 401 && code === 'NOT_AUTHORIZED') {
      forceLogout('Authorization failed. Please login again.');
    }

    return Promise.reject(error);
  }
);

export default API;
