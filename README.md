# namequalsmain.dev — portfolio site

[![Backend CI](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/backend.yml/badge.svg)](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/frontend.yml/badge.svg)](https://github.com/namequalsmain/namequalsmain.dev/actions/workflows/frontend.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A full-stack personal portfolio: public landing with my projects, and an admin
panel where I can add / edit / reorder projects from the browser without
touching code.

Built to demonstrate end-to-end web development — REST API, JWT auth, a SPA,
and deployment across two hosts.

---

## Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI (async) + SQLAlchemy 2 + SQLite + Alembic |
| Auth | JWT (HS256) + bcrypt-hashed admin password |
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Data fetching | TanStack Query (React Query) |
| Routing | React Router v6 |
| Hosting (frontend) | Netlify (static build, free CDN) |
| Hosting (backend) | Render free tier + UptimeRobot keep-alive |

---

## Project layout

```
portfolio/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS + routers
│   │   ├── config.py          # settings from .env
│   │   ├── database.py        # engine, session_maker
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT issue/verify + bcrypt
│   │   ├── deps.py            # FastAPI dependencies
│   │   ├── routers/           # auth, projects, profile, uploads
│   │   └── repo/              # repository layer (all SQL lives here)
│   ├── alembic/               # migrations
│   ├── tests/                 # pytest
│   ├── uploads/               # user-uploaded files (gitignored)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # typed API client
│   │   ├── pages/             # Home, ProjectDetail, admin/*
│   │   ├── components/        # Hero, ProjectCard, ProtectedRoute, etc.
│   │   └── lib/               # auth helpers
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml         # local dev (backend + frontend)
└── README.md
```

---

## Local dev

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # fill in ADMIN_PASSWORD etc.
alembic upgrade head
uvicorn app.main:app --reload
# → http://localhost:8000
# → docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                 # set VITE_API_URL=http://localhost:8000
npm run dev
# → http://localhost:5173
```

### Or with Docker

```bash
docker compose up --build
```

---

## Deployment

See [docs/DEPLOY.md](docs/DEPLOY.md) for step-by-step Netlify + Render guide.

---

## License

MIT — see [LICENSE](LICENSE).
