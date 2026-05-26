"""FastAPI dependencies.

  - get_session : provides AsyncSession (re-exported from database)
  - current_admin : extracts and verifies JWT, returns AdminUser
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import decode_token
from app.database import get_session
from app.models import AdminUser

# tokenUrl is just for OpenAPI docs UI — it's the path of our /login endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep,
) -> AdminUser:
    """Verify the JWT and load the admin row. 401 on any failure."""
    creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None or "sub" not in payload:
        raise creds_error
    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError) as e:
        raise creds_error from e

    user = await session.get(AdminUser, user_id)
    if user is None:
        raise creds_error
    return user


AdminDep = Annotated[AdminUser, Depends(current_admin)]
