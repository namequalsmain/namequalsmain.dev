"""Settings loaded from .env via pydantic-settings.

Validation happens at import time — missing required vars fail fast.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Auth
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Bootstrap admin (used on startup if no admin row exists)
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str

    # Database — SQLite for dev, Postgres (Neon) for prod
    DATABASE_URL: str = "sqlite+aiosqlite:///./portfolio.db"

    # CORS — comma-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:5173"

    # Uploads & storage
    STORAGE_BACKEND: str = "local"    # "local" | "r2"
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024  # 5 MB

    # Local storage (used when STORAGE_BACKEND=local)
    UPLOAD_DIR: str = "./uploads"

    # Cloudflare R2 (used when STORAGE_BACKEND=r2)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET: str = ""
    R2_PUBLIC_BASE_URL: str = ""      # e.g. https://pub-xxx.r2.dev

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
