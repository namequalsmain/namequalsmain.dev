"""POST /api/uploads — admin-only image upload.

Stores files in UPLOAD_DIR with a random filename to avoid collisions.
Returns the relative URL — the frontend prefixes it with the API base.
"""

import secrets
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app import schemas
from app.config import settings
from app.deps import AdminDep

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("", response_model=schemas.UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    _: AdminDep,
    file: UploadFile = File(...),
) -> schemas.UploadResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported content type: {file.content_type}",
        )
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported file extension: {ext}",
        )

    # Read into memory once to enforce size limit; for a portfolio site
    # files are small (< 5 MB) — no need to stream.
    data = await file.read()
    if len(data) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File too large (max {settings.MAX_UPLOAD_BYTES} bytes)",
        )

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{secrets.token_urlsafe(12)}{ext}"
    (upload_dir / filename).write_bytes(data)

    return schemas.UploadResponse(filename=filename, url=f"/uploads/{filename}")
