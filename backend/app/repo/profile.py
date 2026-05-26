"""Profile singleton (id=1)."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile


async def get(session: AsyncSession) -> Profile:
    """Return the singleton row, creating an empty one on first call."""
    profile = await session.get(Profile, 1)
    if profile is None:
        profile = Profile(id=1)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return profile


async def update(session: AsyncSession, **fields) -> Profile:
    profile = await get(session)
    for key, value in fields.items():
        if value is not None and hasattr(profile, key):
            setattr(profile, key, value)
    await session.commit()
    await session.refresh(profile)
    return profile
