"""Login flow + protected endpoint access."""

import pytest

from app.auth import hash_password
from app.repo import admin_users as admin_users_repo


@pytest.mark.asyncio
async def test_login_returns_jwt(client, session):
    # Seed an admin with a known password
    await admin_users_repo.create(session, "admin", hash_password("secret"))

    resp = await client.post("/api/auth/login", json={"username": "admin", "password": "secret"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client, session):
    await admin_users_repo.create(session, "admin", hash_password("secret"))

    resp = await client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_endpoint_rejects_no_token(client):
    resp = await client.post(
        "/api/projects",
        json={"slug": "hello", "title": "Hello"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_endpoint_accepts_valid_token(client, session):
    await admin_users_repo.create(session, "admin", hash_password("secret"))

    login = await client.post("/api/auth/login", json={"username": "admin", "password": "secret"})
    token = login.json()["access_token"]

    resp = await client.post(
        "/api/projects",
        json={"slug": "hello", "title": "Hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["slug"] == "hello"
