# Deploy guide

Step-by-step deployment using free tiers across four services:

```
Netlify (frontend) ── https ──► Render (FastAPI) ──► Neon (Postgres)
                                       │
                                       └─► Cloudflare R2 (uploaded images)
```

Total cost: **$0**. Pre-requisites: GitHub account, Cloudflare account (free, no
charge), Render account, Netlify account.

Total time: about **30 minutes**.

---

## 0. Generate production secrets

You'll paste these into Render later. Generate them now and save somewhere safe:

```bash
# A 32-byte secret for signing JWTs
python -c "import secrets; print(secrets.token_urlsafe(32))"

# A strong admin password (or pick your own)
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

Save:
- `SECRET_KEY` = (first output)
- `ADMIN_PASSWORD` = (second output)
- `ADMIN_USERNAME` = `admin`

---

## 1. Neon (Postgres)

1. Go to [console.neon.tech](https://console.neon.tech) → sign in with GitHub.
2. **Create project**:
   - Name: `portfolio`
   - Region: `Europe (Frankfurt)` (closest to Israel + Render's region)
   - Postgres version: latest (default is fine)
3. After it's created, open **Dashboard → Connection details**.
4. Copy the connection string. It looks like:
   ```
   postgresql://user:abc123@ep-cool-name-123.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **Convert it to async** by replacing `postgresql://` with `postgresql+asyncpg://` and removing the `?sslmode=require` query (asyncpg handles SSL by default for Neon).

   Final form:
   ```
   postgresql+asyncpg://user:abc123@ep-cool-name-123.eu-central-1.aws.neon.tech/neondb
   ```

   Save as `DATABASE_URL`.

---

## 2. Cloudflare R2 (image storage)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → sign up if you haven't.
2. Left sidebar → **R2 Object Storage** → **Get started**. On first use Cloudflare asks for billing details. **It will not charge you** — the free tier (10 GB storage + 1M reads/month) is generous; for a portfolio site you'll never exceed it.
3. **Create bucket**:
   - Name: `portfolio-uploads`
   - Location: `Automatic`
4. Open the bucket → **Settings** tab → **Public access** → **Allow Access**. This gives you a public dev URL like `https://pub-<hash>.r2.dev`. Copy it — save as `R2_PUBLIC_BASE_URL`.
5. Back to R2 sidebar → **Manage R2 API Tokens** → **Create API token**:
   - Permission: **Object Read & Write**
   - Specify bucket: select `portfolio-uploads`
   - TTL: forever (or your preference)
   - Click **Create API Token**
6. Save these three values (you can't see them again after closing):
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `Account ID` (also shown on this page, or in R2 sidebar) → save as `R2_ACCOUNT_ID`

---

## 3. Render (backend API)

1. [render.com](https://render.com) → sign in with GitHub.
2. **New +** → **Web Service**.
3. **Connect a repository** → select `namequalsmain.dev`. If you don't see it, click **Configure account** and grant access.
4. Settings:
   - **Name**: `portfolio-api`
   - **Region**: `Frankfurt`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (auto-detected from `Dockerfile`)
   - **Instance Type**: `Free`
5. **Environment Variables** — click **Advanced**, then add each one:
   ```
   SECRET_KEY              = (from step 0)
   ADMIN_USERNAME          = admin
   ADMIN_PASSWORD          = (from step 0)
   DATABASE_URL            = (from step 1)
   CORS_ORIGINS            = http://localhost:5173       # update after step 4
   STORAGE_BACKEND         = r2
   R2_ACCOUNT_ID           = (from step 2)
   R2_ACCESS_KEY_ID        = (from step 2)
   R2_SECRET_ACCESS_KEY    = (from step 2)
   R2_BUCKET               = portfolio-uploads
   R2_PUBLIC_BASE_URL      = (from step 2)
   ```
6. **Create Web Service**. First deploy takes 3-5 minutes (Docker build).
7. When status turns green, your API is live. Copy the URL (something like `https://portfolio-api-xxxx.onrender.com`).
8. **Verify**:
   ```bash
   curl https://portfolio-api-xxxx.onrender.com/api/health
   # → {"status":"ok"}
   ```

---

## 4. Netlify (frontend)

1. [app.netlify.com](https://app.netlify.com) → sign in with GitHub.
2. **Add new site → Import an existing project** → GitHub → select `namequalsmain.dev`.
3. Build settings should auto-populate from `netlify.toml`. Verify:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. **Environment variables** (before deploy):
   ```
   VITE_API_URL = https://portfolio-api-xxxx.onrender.com   # your Render URL
   ```
5. **Deploy site**. First build takes ~1 minute.
6. When done, you get a URL like `https://reverent-tesla-12345.netlify.app`. Copy it.

---

## 5. Wire frontend ↔ backend (CORS)

Back to Render dashboard:

1. Open the `portfolio-api` service → **Environment** tab.
2. Edit `CORS_ORIGINS` → set it to your Netlify URL:
   ```
   CORS_ORIGINS = https://reverent-tesla-12345.netlify.app
   ```
3. **Save Changes** — Render restarts the service automatically.

Try opening your Netlify site. The hero / projects should now load via the live API.

---

## 6. UptimeRobot — keep the backend awake

Render's free tier puts your service to sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds (cold start). A free uptime pinger keeps it warm.

1. [uptimerobot.com](https://uptimerobot.com) → sign up.
2. **Add New Monitor**:
   - Type: `HTTPS`
   - Name: `portfolio-api`
   - URL: `https://portfolio-api-xxxx.onrender.com/api/health`
   - Interval: `5 minutes`
3. Create. Done.

---

## 7. First-time data seeding in production

The empty production DB has no admin and no projects. The app bootstraps the
admin user on startup from `ADMIN_USERNAME` + `ADMIN_PASSWORD` — so admin is
ready immediately.

Two ways to populate projects:

**a) Through the admin UI (recommended for ongoing use):**
1. Open `https://<your-netlify>/admin/login`
2. Log in with `admin` / `<ADMIN_PASSWORD>`
3. Click **+ New project** — fill in fields, upload cover + gallery images (which now go to R2)
4. Click **Edit profile** — fill in bio, headline, contacts

**b) Re-run seed_demo.py against the prod DB (one-off, for initial demo):**
1. Locally, copy your prod `DATABASE_URL` into `backend/.env` (temporarily)
2. `cd backend && python seed_demo.py`
3. **Revert** `.env` back to local SQLite
4. ⚠️ The seed script only knows about local images (it copies from `market/docs/screenshots/` into `backend/uploads/`). For production with R2, do step (a) instead — re-upload images through the UI.

---

## 8. Custom domain (optional)

If you bought a domain (say `yourname.dev`):

**On the domain registrar's DNS:**
- `yourname.dev` → CNAME → `<your-netlify>.netlify.app`
- `api.yourname.dev` → CNAME → `<your-render>.onrender.com`

**On Netlify** → Domain management → Add custom domain → `yourname.dev`. SSL cert auto-issues in ~5 min.

**On Render** → Custom domains → Add → `api.yourname.dev`. SSL cert auto-issues.

**Update env vars:**
- Render `CORS_ORIGINS` → `https://yourname.dev`
- Netlify `VITE_API_URL` → `https://api.yourname.dev`

---

## Troubleshooting

**Frontend renders but API calls fail with CORS error.**
`CORS_ORIGINS` on Render doesn't match your Netlify URL. Must be exact — `https://`, no trailing slash. Restart the service after changing.

**Login works but uploading an image fails.**
Check Render logs for R2 errors. Most common: `R2_PUBLIC_BASE_URL` doesn't match the bucket's actual public URL, or the API token doesn't include write permission.

**Site goes blank / projects don't load.**
Check browser DevTools → Network. If `/api/projects` returns 500 — backend can't reach DB. Verify `DATABASE_URL` in Render env starts with `postgresql+asyncpg://` (not `postgresql://`).

**Slow first request after a while.**
Render free tier sleeps after 15 min. UptimeRobot pinging `/api/health` every 5 min prevents it.

**Render keeps the old image while I push new code.**
Free tier sometimes lags. Manual: dashboard → service → **Manual Deploy → Deploy latest commit**.
