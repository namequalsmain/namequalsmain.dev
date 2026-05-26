"""ORM models.

Three tables:
  - admin_users : the single admin (you). Password is bcrypt-hashed.
  - profile     : single-row settings table (name, bio, contacts).
  - projects    : portfolio items, sortable, publishable.
"""

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class Profile(Base):
    """Single-row settings — there's always exactly one profile (id=1)."""
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    headline: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    bio: Mapped[str] = mapped_column(Text, default="", nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telegram: Mapped[str | None] = mapped_column(String(64), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    summary: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Stored as JSON array of strings: ["python", "fastapi", "react"]
    tech_stack: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    demo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Filename in UPLOAD_DIR (e.g. 'abcd-screenshot.png'), not a full URL.
    cover_image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Optional extra screenshots — list of filenames in UPLOAD_DIR.
    gallery: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
