"""Settings loaded from .env via pydantic-settings.

Validation happens at import time — missing required vars fail fast.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Auth
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Bootstrap admin
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./portfolio.db"

    # CORS — comma-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:5173"

    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024  # 5 MB

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
