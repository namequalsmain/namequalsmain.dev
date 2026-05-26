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

# Add backend/ to sys.path so `from app...` works when run directly
BACKEND_ROOT = Path(__file__).parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import async_session_maker  # noqa: E402
from app.repo import profile as profile_repo  # noqa: E402
from app.repo import projects as projects_repo  # noqa: E402


# ─── Content ────────────────────────────────────────────────────────────────
PROFILE = dict(
    name="namequalsmain",
    headline="Python developer. Backends, bots, automation.",
    bio=(
        "I build Python backends and integrations: REST APIs, Telegram bots, "
        "data pipelines, automation tools.\n\n"
        "Production code — typed, tested, dockerized, with proper migrations "
        "and a clean separation between data, logic, and UI. No "
        "framework-of-the-month, no half-finished demos.\n\n"
        "Based in Israel. Open to contract work."
    ),
    email="namequalsmain@gmail.com",
    telegram=None,                              # fill via /admin/profile when ready
    github_url="https://github.com/namequalsmain",
    linkedin_url=None,
)


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


# ─── Cover image ────────────────────────────────────────────────────────────
BOT_SCREENSHOTS = (BACKEND_ROOT / ".." / ".." / "market" / "docs" / "screenshots").resolve()
COVER_SOURCE = BOT_SCREENSHOTS / "01-main-menu.png"


def copy_cover_image() -> str | None:
    """Copy a screenshot from the bot repo into backend/uploads/ with a random name.

    Returns the new filename, or None if the source isn't there.
    """
    if not COVER_SOURCE.exists():
        print(f"  [warn] no cover image at {COVER_SOURCE} - skipping cover")
        return None

    uploads = BACKEND_ROOT / "uploads"
    uploads.mkdir(exist_ok=True)
    new_name = f"{secrets.token_urlsafe(12)}-bot-cover.png"
    shutil.copy(COVER_SOURCE, uploads / new_name)
    print(f"  [ok] copied cover image -> uploads/{new_name}")
    return new_name


# ─── Main ───────────────────────────────────────────────────────────────────
async def main() -> None:
    print("Seeding portfolio demo content...")

    cover_filename = copy_cover_image()

    async with async_session_maker() as session:
        # Profile (singleton)
        await profile_repo.update(session, **PROFILE)
        print("  [ok] profile updated")

        # Project - re-create if it exists, so the script is idempotent
        existing = await projects_repo.get_by_slug(session, PROJECT["slug"])
        if existing:
            await projects_repo.delete(session, existing)
            print(f"  [-] removed existing '{PROJECT['slug']}'")

        await projects_repo.create(
            session,
            cover_image=cover_filename,
            **PROJECT,
        )
        print(f"  [ok] project '{PROJECT['title']}' created")

    print("\nDone. If the backend isn't running:")
    print("    python main.py   (from project root)")
    print("Then open http://localhost:5173")


if __name__ == "__main__":
    asyncio.run(main())
