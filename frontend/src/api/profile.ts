import { api } from './client';
import type { Profile, ProfileUpdate } from './types';

export const profileApi = {
  get: () => api.get<Profile>('/api/profile').then((r) => r.data),
  update: (payload: ProfileUpdate) =>
    api.patch<Profile>('/api/profile', payload).then((r) => r.data),
};
