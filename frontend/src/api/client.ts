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

/** Turn a stored filename (`abcd.png`) into a full URL to the upload. */
export function uploadUrl(filename: string | null | undefined): string | null {
  if (!filename) return null;
  // Backend serves /uploads/<filename>
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/uploads/')) return `${API_URL}${filename}`;
  return `${API_URL}/uploads/${filename}`;
}
