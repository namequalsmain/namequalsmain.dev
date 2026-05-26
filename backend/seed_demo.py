"""One-off seed: populate profile + add the Telegram marketplace bot project.

Reproducible "demo content" for the portfolio. Re-runnable: it deletes the
project before re-creating it, and patches the profile.

Usage:
    cd backend
    python seed_demo.py
"""

import asyncio
import secrets
import shutil
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import async_session_maker  # noqa: E402
from app.repo import profile as profile_repo  # noqa: E402
from app.repo import projects as projects_repo  # noqa: E402

# ─── Profile content ────────────────────────────────────────────────────────
PROFILE = dict(
    name="namequalsmain",
    headline="Python developer. Backends, bots, automation.",
    bio=(
        "I build Python backends and integrations: REST APIs, Telegram bots, "
        "data pipelines, automation tools.\n\n"
        "Day-to-day stack: FastAPI · aiogram 3 · SQLAlchemy 2 async · "
        "PostgreSQL · Alembic · Docker. Comfortable with async patterns, "
        "type-driven design (Pydantic, typed CallbackData factories), and "
        "the boring-but-important parts — migrations, structured logging, "
        "CI pipelines, deploy.\n\n"
        "What I take end-to-end:\n"
        "  — REST APIs with proper schemas, JWT auth, OpenAPI docs\n"
        "  — Telegram bots: FSM flows, payments, broadcasts, admin panels\n"
        "  — Data layer: async SQLAlchemy, migrations, repository pattern\n"
        "  — Integrations & scraping: httpx, retries, rate limiting\n"
        "  — Deployment: Docker, GitHub Actions, Render / Fly.io / VPS\n\n"
        "Production code — typed, tested, dockerized, no framework-of-the-month, "
        "no half-finished demos.\n\n"
        "Based in Israel. Open to contract work."
    ),
    email="namequalsmain@gmail.com",
    telegram=None,
    github_url="https://github.com/namequalsmain",
    linkedin_url=None,
)


# ─── Project content ────────────────────────────────────────────────────────
BOT_DESCRIPTION = """\
A complete marketplace platform inside Telegram. Users browse a category tree, \
view product cards with photos, and pay with Telegram Stars — all without \
leaving the chat. The admin panel handles everything that would normally \
require code changes: adding products and categories, broadcasting messages \
with rate-limit handling, viewing statistics, moderating users, and toggling \
features like force-subscribe.

Architectural choices worth pointing out:

— Repository pattern. Handlers never touch raw SQL. Schema changes mean \
editing the repo layer; everything else stays put.

— Typed CallbackData factories. No fragile `call.data.split(":")[2]` parsing; \
renames are caught by the IDE.

— i18n separated from logic. Adding a language is one dict entry, not a code \
audit. Russian and English ship by default.

— Settings live in the database, not in env. Admin toggles things like \
force-subscribe or the ToS text from the UI, no restart needed.

Built with aiogram 3, SQLAlchemy 2 async, PostgreSQL, Alembic for migrations, \
and Docker for one-command deployment. Tested with pytest (18 cases covering \
the repo layer and i18n), linted with ruff, CI on GitHub Actions.\
"""


PROJECT = dict(
    slug="telegram-marketplace-bot",
    title="Telegram Marketplace Bot",
    summary=(
        "Production-ready marketplace bot — category tree of any depth, "
        "Telegram Stars payments, full admin panel, RU/EN i18n."
    ),
    description=BOT_DESCRIPTION,
    tech_stack=[
        "python", "aiogram", "sqlalchemy", "postgresql", "asyncio",
        "alembic", "docker", "pytest", "ruff",
    ],
    github_url="https://github.com/namequalsmain/telegram-marketplace-bot",
    demo_url=None,                              # add t.me/your_bot once deployed
    sort_order=0,
    is_published=True,
)


# ─── Images ─────────────────────────────────────────────────────────────────
BOT_SCREENSHOTS = (BACKEND_ROOT / ".." / ".." / "market" / "docs" / "screenshots").resolve()
COVER_FILE = "01-main-menu.png"
GALLERY_FILES = ["01-main-menu.png", "02-catalog.png", "03-product-list.png", "04-settings.png"]


def copy_image(src_filename: str, prefix: str) -> str | None:
    """Copy one screenshot into backend/uploads/. Returns '/uploads/<new>' path.

    Matches the storage abstraction format (LocalStorage returns '/uploads/...').
    """
    src = BOT_SCREENSHOTS / src_filename
    if not src.exists():
        print(f"  [warn] missing source: {src}")
        return None
    uploads = BACKEND_ROOT / "uploads"
    uploads.mkdir(exist_ok=True)
    new_name = f"{secrets.token_urlsafe(10)}-{prefix}-{src_filename}"
    shutil.copy(src, uploads / new_name)
    return f"/uploads/{new_name}"


def stage_images() -> tuple[str | None, list[str]]:
    """Copy cover + all gallery shots. Returns (cover_filename, [gallery_filenames])."""
    cover = copy_image(COVER_FILE, "cover")
    if cover:
        print(f"  [ok] cover     -> uploads/{cover}")

    gallery: list[str] = []
    for src in GALLERY_FILES:
        new = copy_image(src, "gallery")
        if new:
            gallery.append(new)
            print(f"  [ok] gallery   -> uploads/{new}")
    return cover, gallery


# ─── Main ───────────────────────────────────────────────────────────────────
async def main() -> None:
    print("Seeding portfolio demo content...")
    cover_filename, gallery_filenames = stage_images()

    async with async_session_maker() as session:
        await profile_repo.update(session, **PROFILE)
        print("  [ok] profile updated")

        existing = await projects_repo.get_by_slug(session, PROJECT["slug"])
        if existing:
            await projects_repo.delete(session, existing)
            print(f"  [-]  removed existing '{PROJECT['slug']}'")

        await projects_repo.create(
            session,
            cover_image=cover_filename,
            gallery=gallery_filenames,
            **PROJECT,
        )
        print(f"  [ok] project '{PROJECT['title']}' created with "
              f"{len(gallery_filenames)} gallery images")

    print("\nDone. If the backend isn't running:")
    print("    python main.py   (from project root)")
    print("Then open http://localhost:5173")


if __name__ == "__main__":
    asyncio.run(main())
