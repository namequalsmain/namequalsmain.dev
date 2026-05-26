"""POST /api/uploads — admin-only image upload.

Delegates to the configured Storage backend (local filesystem or R2).
Returns the URL/path that should be saved into project.cover_image / gallery.
"""

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app import schemas
from app.config import settings
from app.deps import AdminDep
from app.storage import storage

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

    data = await file.read()
    if len(data) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File too large (max {settings.MAX_UPLOAD_BYTES} bytes)",
        )

    url = await storage.put(data, ext, file.content_type)
    # Compat: `filename` in the response now holds the storage key/path/URL.
    # The schema name is preserved for backward compat — old clients still work.
    return schemas.UploadResponse(filename=url, url=url)
