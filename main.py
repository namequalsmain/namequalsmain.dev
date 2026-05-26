"""One-command dev launcher.

Runs FastAPI backend (uvicorn) and Vite frontend dev server side by side.
Ctrl+C kills both cleanly.

Usage:
    python main.py

That's it.
"""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
IS_WIN = sys.platform == "win32"


# ─── pretty printing ────────────────────────────────────────────────────────
def info(msg: str) -> None:
    print(f"\033[36m[launcher]\033[0m {msg}")


def warn(msg: str) -> None:
    print(f"\033[33m[launcher]\033[0m {msg}")


def fail(msg: str) -> None:
    print(f"\033[31m[launcher]\033[0m {msg}")


# ─── pre-flight checks ──────────────────────────────────────────────────────
def check_env() -> None:
    """Verify both projects look set up. Print actionable hints if not."""
    if not (BACKEND / ".env").exists():
        warn("backend/.env not found — copying from .env.example")
        (BACKEND / ".env").write_text(
            (BACKEND / ".env.example").read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        warn("    edit backend/.env and set ADMIN_PASSWORD + SECRET_KEY before first prod use")

    if not (FRONTEND / ".env").exists():
        (FRONTEND / ".env").write_text(
            (FRONTEND / ".env.example").read_text(encoding="utf-8"),
            encoding="utf-8",
        )

    if not (FRONTEND / "node_modules").exists():
        fail("frontend/node_modules missing. Run once:\n    cd frontend && npm install")
        sys.exit(1)

    try:
        import uvicorn  # noqa: F401
    except ImportError:
        fail("uvicorn not installed. Run once:\n    cd backend && pip install -r requirements.txt")
        sys.exit(1)


# ─── subprocess management ──────────────────────────────────────────────────
def start_frontend() -> subprocess.Popen:
    """Spawn `npm run dev` in frontend/. Output streams to current terminal."""
    info("Starting frontend (vite) on http://localhost:5173 ...")
    # Windows needs shell=True to find npm.cmd; pass new process group so we can kill cleanly.
    kwargs: dict = {"cwd": str(FRONTEND)}
    if IS_WIN:
        kwargs["shell"] = True
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP  # type: ignore[attr-defined]
    else:
        kwargs["start_new_session"] = True
    return subprocess.Popen(["npm", "run", "dev"], **kwargs)


def stop_process(proc: subprocess.Popen, name: str) -> None:
    """Politely terminate, then force-kill if needed."""
    if proc.poll() is not None:
        return
    info(f"Stopping {name} (pid {proc.pid}) ...")
    try:
        if IS_WIN:
            # On Windows, send CTRL_BREAK to the new process group
            proc.send_signal(signal.CTRL_BREAK_EVENT)  # type: ignore[attr-defined]
        else:
            proc.terminate()
        proc.wait(timeout=5)
    except (subprocess.TimeoutExpired, OSError):
        warn(f"{name} didn't stop in time, killing ...")
        try:
            if IS_WIN:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], check=False)
            else:
                proc.kill()
        except Exception as e:  # noqa: BLE001
            warn(f"failed to kill {name}: {e}")


# ─── main ───────────────────────────────────────────────────────────────────
def main() -> None:
    check_env()

    # Ensure imports inside uvicorn worker resolve `app.*` correctly
    os.chdir(BACKEND)
    sys.path.insert(0, str(BACKEND))

    frontend = start_frontend()
    # Tiny stagger so frontend banner doesn't tangle with backend banner
    time.sleep(0.5)

    info("Starting backend (uvicorn) on http://localhost:8000 ...")
    info("  - API docs:    http://localhost:8000/docs")
    info("  - Frontend:    http://localhost:5173")
    info("  - Admin login: http://localhost:5173/admin/login")
    info("Press Ctrl+C to stop both.")

    # Lazy import so we can fail fast in check_env() with a nicer message
    import uvicorn

    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            reload_dirs=["app"],
            log_level="info",
        )
    except KeyboardInterrupt:
        pass
    finally:
        stop_process(frontend, "frontend")
        info("Done.")


if __name__ == "__main__":
    main()
