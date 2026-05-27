// Edit this file to add / edit / hide projects.
// To add a new one: push a new object to the array. No backend, no build steps.
//
// Tips:
//   - `slug` is the URL part (/projects/<slug>) — keep it lowercase, hyphenated
//   - `cover_image` and `gallery` paths are relative to /public, e.g.
//     '/images/bot/01-main-menu.png'  →  frontend/public/images/bot/01-main-menu.png
//   - `is_published: false` hides the entry without deleting it
//   - lower `sort_order` shows first

import type { Project } from './types';

export const projects: Project[] = [
  {
    slug: 'telegram-marketplace-bot',
    title: 'Telegram Marketplace Bot',
    summary:
      'Production-ready marketplace bot — category tree of any depth, ' +
      'Telegram Stars payments, full admin panel, RU/EN i18n.',
    description:
      'A complete marketplace platform inside Telegram. Users browse a category tree, ' +
      'view product cards with photos, and pay with Telegram Stars — all without ' +
      'leaving the chat. The admin panel handles everything that would normally ' +
      'require code changes: adding products and categories, broadcasting messages ' +
      'with rate-limit handling, viewing statistics, moderating users, and toggling ' +
      'features like force-subscribe.\n\n' +
      'Architectural choices worth pointing out:\n\n' +
      '— Repository pattern. Handlers never touch raw SQL. Schema changes mean ' +
      'editing the repo layer; everything else stays put.\n\n' +
      '— Typed CallbackData factories. No fragile `call.data.split(":")[2]` parsing; ' +
      'renames are caught by the IDE.\n\n' +
      '— i18n separated from logic. Adding a language is one dict entry, not a ' +
      'code audit. Russian and English ship by default.\n\n' +
      '— Settings live in the database, not in env. Admin toggles things like ' +
      'force-subscribe or the ToS text from the UI, no restart needed.\n\n' +
      'Built with aiogram 3, SQLAlchemy 2 async, PostgreSQL, Alembic for migrations, ' +
      'and Docker for one-command deployment. Tested with pytest (18 cases covering ' +
      'the repo layer and i18n), linted with ruff, CI on GitHub Actions.',
    tech_stack: [
      'python', 'aiogram', 'sqlalchemy', 'postgresql', 'asyncio',
      'alembic', 'docker', 'pytest', 'ruff',
    ],
    github_url: 'https://github.com/namequalsmain/telegram-marketplace-bot',
    demo_url: null,
    cover_image: '/images/bot/01-main-menu.png',
    gallery: [
      '/images/bot/01-main-menu.png',
      '/images/bot/02-catalog.png',
      '/images/bot/03-product-list.png',
      '/images/bot/04-settings.png',
    ],
    sort_order: 0,
    is_published: true,
  },
];

/** Helpers used by pages. */
export const publishedProjects = (): Project[] =>
  projects
    .filter((p) => p.is_published)
    .sort((a, b) => a.sort_order - b.sort_order);

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug && p.is_published);
