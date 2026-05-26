// API DTOs. Keep in sync with backend/app/schemas.py.

export type Project = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  demo_url: string | null;
  cover_image: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  tech_stack?: string[];
  github_url?: string | null;
  demo_url?: string | null;
  cover_image?: string | null;
  sort_order?: number;
  is_published?: boolean;
};

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  email: string | null;
  telegram: string | null;
  github_url: string | null;
  linkedin_url: string | null;
};

export type ProfileUpdate = Partial<Profile>;

export type LoginRequest = { username: string; password: string };
export type TokenResponse = { access_token: string; token_type: string };
export type UploadResponse = { filename: string; url: string };
