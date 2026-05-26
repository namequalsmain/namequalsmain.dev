"""Project CRUD."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project


async def list_public(session: AsyncSession) -> list[Project]:
    """Only published projects, ordered for public view."""
    res = await session.execute(
        select(Project)
        .where(Project.is_published.is_(True))
        .order_by(Project.sort_order, Project.created_at.desc())
    )
    return list(res.scalars().all())


async def list_all(session: AsyncSession) -> list[Project]:
    """All projects (admin view)."""
    res = await session.execute(
        select(Project).order_by(Project.sort_order, Project.created_at.desc())
    )
    return list(res.scalars().all())


async def get(session: AsyncSession, project_id: int) -> Project | None:
    return await session.get(Project, project_id)


async def get_by_slug(session: AsyncSession, slug: str) -> Project | None:
    res = await session.execute(select(Project).where(Project.slug == slug))
    return res.scalar_one_or_none()


async def create(session: AsyncSession, **fields) -> Project:
    project = Project(**fields)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


async def update(session: AsyncSession, project: Project, **fields) -> Project:
    for key, value in fields.items():
        if value is not None and hasattr(project, key):
            setattr(project, key, value)
    await session.commit()
    await session.refresh(project)
    return project


async def delete(session: AsyncSession, project: Project) -> None:
    await session.delete(project)
    await session.commit()
