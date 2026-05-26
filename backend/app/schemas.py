"""Pydantic schemas — request bodies and response models for the API.

Naming convention:
  - `Foo`        — full read schema (what the API returns)
  - `FooCreate`  — payload to create
  - `FooUpdate`  — partial-update payload (all fields optional)
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ─── Auth ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Profile ────────────────────────────────────────────────────────────────
class Profile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    headline: str
    bio: str
    email: str | None = None
    telegram: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None


class ProfileUpdate(BaseModel):
    name: str | None = None
    headline: str | None = None
    bio: str | None = None
    email: str | None = None
    telegram: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None


# ─── Projects ───────────────────────────────────────────────────────────────
class Project(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    description: str
    tech_stack: list[str]
    github_url: str | None = None
    demo_url: str | None = None
    cover_image: str | None = None
    sort_order: int
    is_published: bool
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=128, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=128)
    summary: str = Field(default="", max_length=255)
    description: str = ""
    tech_stack: list[str] = []
    github_url: str | None = None
    demo_url: str | None = None
    cover_image: str | None = None
    sort_order: int = 0
    is_published: bool = True


class ProjectUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=128, pattern=r"^[a-z0-9-]+$")
    title: str | None = Field(default=None, min_length=1, max_length=128)
    summary: str | None = Field(default=None, max_length=255)
    description: str | None = None
    tech_stack: list[str] | None = None
    github_url: str | None = None
    demo_url: str | None = None
    cover_image: str | None = None
    sort_order: int | None = None
    is_published: bool | None = None


# ─── Uploads ────────────────────────────────────────────────────────────────
class UploadResponse(BaseModel):
    filename: str
    url: str  # absolute or relative URL to access the file
