"""Pluggable storage for uploaded files.

Two backends:
  - LocalStorage  → writes to UPLOAD_DIR; FastAPI serves it at /uploads/<name>.
  - R2Storage     → Cloudflare R2 (S3-compatible); returns a public URL.

Both return a string that the API stores in `cover_image` / `gallery`. That
string is either:
  - a relative path like '/uploads/abcd.png' (local backend), OR
  - a full HTTPS URL (R2 backend).

The frontend resolves either form via `uploadUrl()`.
"""

from __future__ import annotations

import secrets
from abc import ABC, abstractmethod
from pathlib import Path

import aioboto3
from botocore.config import Config

from app.config import settings


# ─── Abstract interface ─────────────────────────────────────────────────────
class Storage(ABC):
    @abstractmethod
    async def put(self, content: bytes, ext: str, content_type: str) -> str:
        """Store `content` under a random key. Return the URL/path to access it."""


# ─── Local filesystem ───────────────────────────────────────────────────────
class LocalStorage(Storage):
    """Writes to UPLOAD_DIR. The FastAPI app mounts that dir at /uploads/<name>."""

    def __init__(self, upload_dir: str, public_prefix: str = "/uploads") -> None:
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.public_prefix = public_prefix.rstrip("/")

    async def put(self, content: bytes, ext: str, content_type: str) -> str:
        name = f"{secrets.token_urlsafe(12)}{ext}"
        (self.upload_dir / name).write_bytes(content)
        return f"{self.public_prefix}/{name}"


# ─── Cloudflare R2 (S3-compatible) ──────────────────────────────────────────
class R2Storage(Storage):
    """Cloudflare R2 — S3-compatible object storage.

    The bucket must be configured for public read access (or be behind a
    custom domain). `public_base_url` is the URL prefix that points to the
    bucket from the outside world.
    """

    def __init__(
        self,
        *,
        account_id: str,
        access_key_id: str,
        secret_access_key: str,
        bucket: str,
        public_base_url: str,
    ) -> None:
        self.endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
        self.bucket = bucket
        self.public_base_url = public_base_url.rstrip("/")
        self._session = aioboto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
        )

    async def put(self, content: bytes, ext: str, content_type: str) -> str:
        key = f"{secrets.token_urlsafe(12)}{ext}"
        # R2 uses 'auto' region; signature v4 required.
        config = Config(signature_version="s3v4", region_name="auto")
        async with self._session.client("s3", endpoint_url=self.endpoint_url, config=config) as s3:
            await s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
        return f"{self.public_base_url}/{key}"


# ─── Factory ────────────────────────────────────────────────────────────────
def get_storage() -> Storage:
    """Returns a singleton-style storage instance for the configured backend.

    Configured once at import; safe for FastAPI's single-process lifecycle.
    """
    backend = settings.STORAGE_BACKEND.lower()
    if backend == "r2":
        missing = [
            name for name, val in {
                "R2_ACCOUNT_ID": settings.R2_ACCOUNT_ID,
                "R2_ACCESS_KEY_ID": settings.R2_ACCESS_KEY_ID,
                "R2_SECRET_ACCESS_KEY": settings.R2_SECRET_ACCESS_KEY,
                "R2_BUCKET": settings.R2_BUCKET,
                "R2_PUBLIC_BASE_URL": settings.R2_PUBLIC_BASE_URL,
            }.items() if not val
        ]
        if missing:
            raise RuntimeError(
                f"STORAGE_BACKEND=r2 but missing env vars: {', '.join(missing)}"
            )
        return R2Storage(
            account_id=settings.R2_ACCOUNT_ID,
            access_key_id=settings.R2_ACCESS_KEY_ID,
            secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            bucket=settings.R2_BUCKET,
            public_base_url=settings.R2_PUBLIC_BASE_URL,
        )
    # Default — local filesystem
    return LocalStorage(upload_dir=settings.UPLOAD_DIR)


storage = get_storage()
