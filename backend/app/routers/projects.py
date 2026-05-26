"""Projects CRUD. GET is public, the rest require admin."""

from fastapi import APIRouter, HTTPException, status

from app import schemas
from app.deps import AdminDep, SessionDep
from app.repo import projects as projects_repo

router = APIRouter(prefix="/api/projects", tags=["projects"])


# ─── Public reads ───────────────────────────────────────────────────────────
@router.get("", response_model=list[schemas.Project])
async def list_projects(session: SessionDep) -> list[schemas.Project]:
    items = await projects_repo.list_public(session)
    return [schemas.Project.model_validate(p) for p in items]


@router.get("/{slug}", response_model=schemas.Project)
async def get_project(slug: str, session: SessionDep) -> schemas.Project:
    project = await projects_repo.get_by_slug(session, slug)
    if project is None or not project.is_published:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return schemas.Project.model_validate(project)


# ─── Admin: list ALL (including unpublished) ────────────────────────────────
@router.get("/admin/all", response_model=list[schemas.Project])
async def list_all_projects(session: SessionDep, _: AdminDep) -> list[schemas.Project]:
    items = await projects_repo.list_all(session)
    return [schemas.Project.model_validate(p) for p in items]


# ─── Admin: create ──────────────────────────────────────────────────────────
@router.post("", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: schemas.ProjectCreate,
    session: SessionDep,
    _: AdminDep,
) -> schemas.Project:
    if await projects_repo.get_by_slug(session, payload.slug):
        raise HTTPException(status.HTTP_409_CONFLICT, "slug already exists")
    project = await projects_repo.create(session, **payload.model_dump())
    return schemas.Project.model_validate(project)


# ─── Admin: update ──────────────────────────────────────────────────────────
@router.patch("/{project_id}", response_model=schemas.Project)
async def update_project(
    project_id: int,
    payload: schemas.ProjectUpdate,
    session: SessionDep,
    _: AdminDep,
) -> schemas.Project:
    project = await projects_repo.get(session, project_id)
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    # slug uniqueness check when changing slug
    new_slug = payload.slug
    if new_slug and new_slug != project.slug:
        existing = await projects_repo.get_by_slug(session, new_slug)
        if existing:
            raise HTTPException(status.HTTP_409_CONFLICT, "slug already exists")

    updated = await projects_repo.update(session, project, **payload.model_dump(exclude_unset=True))
    return schemas.Project.model_validate(updated)


# ─── Admin: delete ──────────────────────────────────────────────────────────
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    session: SessionDep,
    _: AdminDep,
) -> None:
    project = await projects_repo.get(session, project_id)
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    await projects_repo.delete(session, project)
