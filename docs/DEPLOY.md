# Deploy guide

Two pieces — frontend (static) and backend (Python). They live on different
hosts: Netlify for the static frontend, Render for the FastAPI backend.

---

## 1. Backend → Render

1. Create an account at [render.com](https://render.com) and connect your GitHub.
2. **New +** → **Web Service** → select this repo.
3. Settings:
   - **Name**: `portfolio-backend` (becomes URL `portfolio-backend.onrender.com`)
   - **Root directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: Free
4. **Environment variables** (Settings → Environment):
   ```
   SECRET_KEY        — generate locally with:
                        python -c "import secrets; print(secrets.token_urlsafe(32))"
   ADMIN_USERNAME    — admin
   ADMIN_PASSWORD    — pick something strong
   DATABASE_URL      — sqlite+aiosqlite:////var/data/portfolio.db
   CORS_ORIGINS      — https://<your-site>.netlify.app
   UPLOAD_DIR        — /var/data/uploads
   ```
5. **Persistent disk** (Settings → Disks): add 1 GB at `/var/data` so SQLite + uploads survive restarts.
6. Click **Create Web Service**. First deploy takes ~3 min.
7. Verify: `curl https://portfolio-backend.onrender.com/api/health` should return `{"status":"ok"}`.

### Keep-alive (defeats Render's 15-min sleep on the free tier)

1. Register at [uptimerobot.com](https://uptimerobot.com).
2. **Add New Monitor**:
   - **Type**: HTTPS
   - **URL**: `https://portfolio-backend.onrender.com/api/health`
   - **Interval**: 5 minutes
3. Free tier allows 50 monitors at 5-min interval — plenty.

---

## 2. Frontend → Netlify

1. Create an account at [netlify.com](https://netlify.com), connect GitHub.
2. **Add new site** → **Import from Git** → select this repo.
3. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. **Environment variables**:
   ```
   VITE_API_URL = https://portfolio-backend.onrender.com
   ```
5. Deploy. First build takes ~1 minute.
6. Add a `_redirects` file at `frontend/public/_redirects` (already in repo) so React Router works on hard refresh:
   ```
   /* /index.html 200
   ```

---

## 3. Custom domain (optional, ~$10/year)

If you bought `yourname.dev`:

1. **In your domain registrar** (Cloudflare / Porkbun / Namecheap):
   - Add CNAME record: `yourname.dev` → `<your-site>.netlify.app`
2. **In Netlify**: Site settings → Domain management → Add custom domain.
3. Netlify automatically issues a Let's Encrypt cert (~5 min).

Also update Render env: `CORS_ORIGINS=https://yourname.dev`.

---

## 4. Updating the site

Every `git push` to `main` triggers:
- Backend: Render rebuilds and redeploys automatically.
- Frontend: Netlify rebuilds and redeploys automatically.

No manual deploys needed.

---

## 5. Troubleshooting

**Frontend loads but API calls fail (CORS error):**
Check `CORS_ORIGINS` on the backend matches your Netlify URL exactly (including `https://`, no trailing slash).

**Login works locally but not in prod:**
Make sure `VITE_API_URL` on Netlify points to the **public Render URL**, not localhost.

**SQLite "database is locked":**
Render free tier has only one worker — should never lock. If you ever scale to multiple workers, switch to Postgres (Neon free tier).
