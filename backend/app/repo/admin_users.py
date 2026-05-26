"""Admin user lookups."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdminUser


async def get_by_username(session: AsyncSession, username: str) -> AdminUser | None:
    res = await session.execute(select(AdminUser).where(AdminUser.username == username))
    return res.scalar_one_or_none()


async def create(session: AsyncSession, username: str, password_hash: str) -> AdminUser:
    user = AdminUser(username=username, password_hash=password_hash)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
