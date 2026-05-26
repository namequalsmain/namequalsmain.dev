import { api } from './client';
import type { LoginRequest, TokenResponse, UploadResponse } from './types';

export const authApi = {
  login: (payload: LoginRequest) =>
    api.post<TokenResponse>('/api/auth/login', payload).then((r) => r.data),
};

export const uploadApi = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<UploadResponse>('/api/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
