"""Profile is a singleton — GET creates it, PATCH updates it."""

import pytest

from app.auth import hash_password
from app.repo import admin_users as admin_users_repo


@pytest.fixture
async def admin_token(client, session):
    await admin_users_repo.create(session, "admin", hash_password("secret"))
    login = await client.post("/api/auth/login", json={"username": "admin", "password": "secret"})
    return login.json()["access_token"]


@pytest.mark.asyncio
async def test_get_profile_returns_empty_on_first_call(client):
    resp = await client.get("/api/profile")
    assert resp.status_code == 200
    assert resp.json()["name"] == ""


@pytest.mark.asyncio
async def test_patch_profile_requires_auth(client):
    resp = await client.patch("/api/profile", json={"name": "Alice"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_patch_profile_updates_fields(client, admin_token):
    resp = await client.patch(
        "/api/profile",
        json={"name": "Alice", "headline": "Python dev"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Alice"
    assert data["headline"] == "Python dev"
