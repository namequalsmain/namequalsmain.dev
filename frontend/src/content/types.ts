// Types for the static portfolio content.
// Add a project = add an entry in projects.ts. No build step changes.

export type Profile = {
  name: string;
  headline: string;
  bio: string;                  // plain text, newlines preserved
  email: string | null;
  telegram: string | null;      // username without '@'
  github_url: string | null;
  linkedin_url: string | null;
};

export type Project = {
  slug: string;                 // URL part: /projects/<slug>
  title: string;
  summary: string;              // 1-2 line teaser
  description: string;          // full body (markdown-ish plain text)
  tech_stack: string[];
  github_url: string | null;
  demo_url: string | null;
  /** Path relative to /public — e.g. '/images/bot/01-main-menu.png' */
  cover_image: string | null;
  gallery: string[];            // additional images, same path style
  sort_order: number;           // lower = appears earlier
  is_published: boolean;        // set false to hide without deleting
};
