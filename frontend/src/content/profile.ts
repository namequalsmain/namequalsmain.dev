// Edit this file to update the "About" section of the site.
// After saving + `git push`, Netlify rebuilds and the change is live.

import type { Profile } from './types';

export const profile: Profile = {
  name: 'namequalsmain',
  headline: 'Python developer. Backends, bots, automation.',
  bio:
    'I build Python backends and integrations: REST APIs, Telegram bots, ' +
    'data pipelines, automation tools.\n\n' +
    'Day-to-day stack: FastAPI · aiogram 3 · SQLAlchemy 2 async · ' +
    'PostgreSQL · Alembic · Docker. Comfortable with async patterns, ' +
    'type-driven design (Pydantic, typed CallbackData factories), and ' +
    'the boring-but-important parts — migrations, structured logging, ' +
    'CI pipelines, deploy.\n\n' +
    'What I take end-to-end:\n' +
    '  — REST APIs with proper schemas, JWT auth, OpenAPI docs\n' +
    '  — Telegram bots: FSM flows, payments, broadcasts, admin panels\n' +
    '  — Data layer: async SQLAlchemy, migrations, repository pattern\n' +
    '  — Integrations & scraping: httpx, retries, rate limiting\n' +
    '  — Deployment: Docker, GitHub Actions, Render / Fly.io / VPS\n\n' +
    'Production code — typed, tested, dockerized, no framework-of-the-month, ' +
    'no half-finished demos.\n\n' +
    'Based in Israel. Open to contract work.',
  email: 'namequalsmain@gmail.com',
  telegram: null,
  github_url: 'https://github.com/namequalsmain',
  linkedin_url: null,
};
