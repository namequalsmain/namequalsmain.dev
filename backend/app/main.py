"""FastAPI app — wires CORS, static files for uploads, and all routers."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.bootstrap import bootstrap
from app.config import settings
from app.routers import auth, profile, projects, uploads

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run on startup, before serving requests."""
    log.info("Starting API")
    await bootstrap()
    yield
    log.info("Shutting down API")


app = FastAPI(
    title="namequalsmain.dev API",
    description="Backend for the personal portfolio site.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (cover images, etc.) at /uploads/<filename>
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(projects.router)
app.include_router(uploads.router)


@app.get("/api/health", tags=["health"])
async def health() -> dict[str, str]:
    """Used by UptimeRobot ping and Render health-check."""
    return {"status": "ok"}
