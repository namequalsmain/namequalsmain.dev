"""POST /api/auth/login — issue a JWT for valid admin credentials."""

from fastapi import APIRouter, HTTPException, status

from app import schemas
from app.auth import create_access_token, verify_password
from app.deps import SessionDep
from app.repo import admin_users as admin_users_repo

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
async def login(payload: schemas.LoginRequest, session: SessionDep) -> schemas.Token:
    user = await admin_users_repo.get_by_username(session, payload.username)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return schemas.Token(access_token=create_access_token(user.id))
