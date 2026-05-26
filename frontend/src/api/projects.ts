import { api } from './client';
import type { Project, ProjectInput } from './types';

export const projectsApi = {
  listPublic: () => api.get<Project[]>('/api/projects').then((r) => r.data),

  listAll: () =>
    api.get<Project[]>('/api/projects/admin/all').then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<Project>(`/api/projects/${slug}`).then((r) => r.data),

  create: (payload: ProjectInput) =>
    api.post<Project>('/api/projects', payload).then((r) => r.data),

  update: (id: number, payload: Partial<ProjectInput>) =>
    api.patch<Project>(`/api/projects/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete<void>(`/api/projects/${id}`).then((r) => r.data),
};
