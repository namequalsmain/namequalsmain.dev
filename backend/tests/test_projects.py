"""Projects CRUD: public reads, admin writes, slug uniqueness, publish filtering."""

import pytest

from app.auth import hash_password
from app.repo import admin_users as admin_users_repo
from app.repo import projects as projects_repo


@pytest.fixture
async def admin_token(client, session):
    await admin_users_repo.create(session, "admin", hash_password("secret"))
    login = await client.post("/api/auth/login", json={"username": "admin", "password": "secret"})
    return login.json()["access_token"]


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_then_list(client, admin_token):
    resp = await client.post(
        "/api/projects",
        json={"slug": "bot", "title": "Telegram Bot", "summary": "A nice bot"},
        headers=auth_header(admin_token),
    )
    assert resp.status_code == 201

    resp = await client.get("/api/projects")
    items = resp.json()
    assert len(items) == 1
    assert items[0]["slug"] == "bot"


@pytest.mark.asyncio
async def test_duplicate_slug_returns_409(client, admin_token):
    payload = {"slug": "bot", "title": "Bot"}
    await client.post("/api/projects", json=payload, headers=auth_header(admin_token))
    resp = await client.post("/api/projects", json=payload, headers=auth_header(admin_token))
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_get_by_slug(client, admin_token):
    await client.post(
        "/api/projects",
        json={"slug": "bot", "title": "Bot"},
        headers=auth_header(admin_token),
    )
    resp = await client.get("/api/projects/bot")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Bot"


@pytest.mark.asyncio
async def test_unpublished_hidden_from_public(client, admin_token, session):
    await projects_repo.create(session, slug="hidden", title="Hidden", is_published=False)
    await projects_repo.create(session, slug="shown", title="Shown", is_published=True)

    resp = await client.get("/api/projects")
    slugs = [p["slug"] for p in resp.json()]
    assert "shown" in slugs
    assert "hidden" not in slugs


@pytest.mark.asyncio
async def test_patch_updates_only_provided_fields(client, admin_token):
    await client.post(
        "/api/projects",
        json={"slug": "bot", "title": "Bot", "summary": "old"},
        headers=auth_header(admin_token),
    )
    # Find id
    pid = (await client.get("/api/projects")).json()[0]["id"]

    resp = await client.patch(
        f"/api/projects/{pid}",
        json={"summary": "new"},
        headers=auth_header(admin_token),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"] == "new"
    assert data["title"] == "Bot"  # untouched


@pytest.mark.asyncio
async def test_delete(client, admin_token):
    await client.post(
        "/api/projects",
        json={"slug": "bot", "title": "Bot"},
        headers=auth_header(admin_token),
    )
    pid = (await client.get("/api/projects")).json()[0]["id"]

    resp = await client.delete(f"/api/projects/{pid}", headers=auth_header(admin_token))
    assert resp.status_code == 204

    resp = await client.get("/api/projects")
    assert resp.json() == []
