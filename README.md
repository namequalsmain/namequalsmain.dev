# namequalsmain.dev — portfolio site

[![Frontend CI](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/frontend.yml/badge.svg)](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/frontend.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A small static portfolio site. Editorial light theme, serif headlines, numbered
project list. Content lives in TypeScript files in `src/content/`; updating it
means editing one file and `git push`. Netlify rebuilds and the change is live
in ~60 seconds.

---

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** for styling (custom "paper" palette, Instrument Serif display)
- **React Router** for client-side routes
- **Netlify** for hosting (free static, instant CDN)

No backend, no database, no auth. Just files.

---

## Local development

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

That's it. Hot reload on every save.

### Build

```bash
npm run build              # production build → dist/
npm run preview            # serve dist/ locally to sanity-check
```

---

## Adding / editing content

Three files cover everything:

| File | What's inside |
|---|---|
| `frontend/src/content/profile.ts`  | Your name, headline, bio, contact links |
| `frontend/src/content/projects.ts` | Array of projects — title, slug, description, tech stack, links, images |
| `frontend/src/content/types.ts`    | Shape of the above (don't usually touch) |

### Add a new project

1. Drop screenshots into `frontend/public/images/<project-name>/`.
2. Open `frontend/src/content/projects.ts` — push a new object to the array:
   ```ts
   {
     slug: 'my-cool-thing',
     title: 'My Cool Thing',
     summary: 'One-liner that shows up on the home page.',
     description: 'Full body. Plain text, newlines preserved.',
     tech_stack: ['python', 'fastapi', 'postgres'],
     github_url: 'https://github.com/.../...',
     demo_url: 'https://yourdemo.app',  // or null
     cover_image: '/images/my-cool-thing/01.png',
     gallery: [
       '/images/my-cool-thing/01.png',
       '/images/my-cool-thing/02.png',
     ],
     sort_order: 0,        // lower = appears earlier
     is_published: true,   // set false to hide without deleting
   },
   ```
3. `git push`. Netlify rebuilds.

### Update About / contact

Open `frontend/src/content/profile.ts`, edit, push.

---

## Layout

```
portfolio/
├── frontend/
│   ├── public/
│   │   └── images/             # project screenshots, favicons, etc.
│   ├── src/
│   │   ├── content/            # ← edit here to update the site
│   │   ├── components/         # Header, Footer, ProjectRow, TechTag
│   │   ├── pages/              # Home, ProjectDetail
│   │   ├── App.tsx             # router
│   │   └── index.css           # Tailwind layers + paper palette
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── netlify.toml                # build settings + SPA redirects
└── README.md
```

---

## Deployment (Netlify)

One-time setup:

1. [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → pick this repo.
2. Build settings are auto-detected from `netlify.toml`:
   - Base: `frontend`
   - Command: `npm run build`
   - Publish: `frontend/dist`
3. Deploy. You get a URL like `https://<random>.netlify.app`.

After that, every `git push` to `main` triggers an automatic rebuild.

To attach a custom domain — Netlify dashboard → Domain management → Add custom domain → follow the DNS instructions.

---

## License

MIT — see [LICENSE](LICENSE).
