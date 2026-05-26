"""Profile endpoints: GET is public, PATCH requires admin."""

from fastapi import APIRouter

from app import schemas
from app.deps import AdminDep, SessionDep
from app.repo import profile as profile_repo

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=schemas.Profile)
async def read_profile(session: SessionDep) -> schemas.Profile:
    profile = await profile_repo.get(session)
    return schemas.Profile.model_validate(profile)


@router.patch("", response_model=schemas.Profile)
async def update_profile(
    payload: schemas.ProfileUpdate,
    session: SessionDep,
    _: AdminDep,
) -> schemas.Profile:
    updated = await profile_repo.update(session, **payload.model_dump(exclude_unset=True))
    return schemas.Profile.model_validate(updated)
