// Axios instance with auth header + 401 handling.

import axios from 'axios';
import { getToken, clearToken } from '@/lib/auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  // Keep the default JSON content type; FormData calls override it.
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Token expired or invalid — drop it and let the router send user to /login.
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      // Hard reload so React Router state resets cleanly.
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Resolve a stored value to a fetchable image URL.
 *
 * The backend stores one of three forms in `cover_image` / `gallery`:
 *   - absolute URL (R2 backend in prod) → return as-is
 *   - '/uploads/...'  (local backend)   → prepend the API origin
 *   - bare filename   (legacy)          → prepend `${API_URL}/uploads/`
 */
export function uploadUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${API_URL}${value}`;
  return `${API_URL}/uploads/${value}`;
}
