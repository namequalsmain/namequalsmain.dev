"""One-time startup tasks: create admin from .env if missing, seed empty profile."""

import logging

from app.auth import hash_password
from app.config import settings
from app.database import async_session_maker
from app.repo import admin_users as admin_users_repo
from app.repo import profile as profile_repo

log = logging.getLogger("bootstrap")


async def bootstrap() -> None:
    async with async_session_maker() as session:
        # Ensure profile singleton row exists
        await profile_repo.get(session)

        # Ensure admin user exists
        existing = await admin_users_repo.get_by_username(session, settings.ADMIN_USERNAME)
        if existing is None:
            await admin_users_repo.create(
                session,
                username=settings.ADMIN_USERNAME,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
            )
            log.info("Created admin user: %s", settings.ADMIN_USERNAME)
        else:
            log.info("Admin user already exists: %s", settings.ADMIN_USERNAME)
