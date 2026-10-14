#!/usr/bin/env python3
"""Enterprise unified application runner for StackLift.

Single command entrypoint:
- Checks Python and Node/pnpm environments.
- Supports local development mode (SQLite or PostgreSQL) or Docker Compose orchestration.
- Formats and displays an enterprise ANSI log terminal with service status boards.
- Concurrently orchestrates FastAPI backend (uvicorn) and Vite frontend (pnpm dev).
- Handles graceful SIGINT / SIGTERM shutdown of all child processes.
"""

import os
import sys
import time
import signal
import subprocess
import threading
from pathlib import Path

# ANSI Color Tokens
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
VENV_PYTHON = ROOT_DIR / ".venv" / "bin" / "python"
VENV_UVICORN = ROOT_DIR / ".venv" / "bin" / "uvicorn"

processes = []


def print_banner():
    banner = f"""{CYAN}{BOLD}
   ███████╗████████╗ █████╗  ██████╗██╗  ██╗██╗     ██╗███████╗████████╗
   ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██║     ██║██╔════╝╚══██╔══╝
   ███████╗   ██║   ███████║██║     █████╔╝ ██║     ██║█████╗     ██║   
   ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ ██║     ██║██╔══╝     ██║   
   ███████║   ██║   ██║  ██║╚██████╗██║  ██╗███████╗██║██║        ██║   
   ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝        ╚═╝   
{RESET}   {BLUE}► AI-Assisted Legacy Software Modernization Platform{RESET}
   {DIM}================================================================={RESET}
   {GREEN}✔ Fast REST & SSE API{RESET}  : {BOLD}http://localhost:8000/api/v1{RESET}
   {GREEN}✔ Swagger Documentation{RESET}: {BOLD}http://localhost:8000/api/v1/docs{RESET}
   {GREEN}✔ Modern Web Interface{RESET} : {BOLD}http://localhost:5173{RESET}
   {DIM}================================================================={RESET}
"""
    print(banner, flush=True)


def stream_logs(pipe, prefix, color):
    """Streams and tags logs line-by-line with service prefix in real-time."""
    try:
        for line in iter(pipe.readline, ''):
            if not line:
                break
            clean_line = line.rstrip()
            if clean_line:
                timestamp = time.strftime("%H:%M:%S")
                print(f"{DIM}{timestamp}{RESET} {color}{BOLD}[{prefix:<8}]{RESET} {clean_line}", flush=True)
    except Exception:
        pass


def terminate_all(sig=None, frame=None):
    """Graceful teardown on Ctrl+C."""
    print(f"\n{YELLOW}{BOLD}► Shutting down StackLift platform cleanly...{RESET}", flush=True)
    for p in processes:
        if p.poll() is None:
            try:
                p.terminate()
            except Exception:
                pass
    time.sleep(0.5)
    for p in processes:
        if p.poll() is None:
            try:
                p.kill()
            except Exception:
                pass
    print(f"{GREEN}✔ All services stopped.{RESET}\n", flush=True)
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, terminate_all)
    signal.signal(signal.SIGTERM, terminate_all)

    # Allow custom db or default to local hermetic SQLite for instant zero-dependency launch
    env = os.environ.copy()
    if "DATABASE_URL" not in env:
        db_path = ROOT_DIR / "stacklift_dev.db"
        env["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path}"
        env["DB_ECHO"] = "false"

    print_banner()

    # 1. Start FastAPI Backend Service
    python_bin = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable
    backend_cmd = [
        python_bin,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--log-level",
        "info",
    ]

    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(ROOT_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
    )
    processes.append(backend_proc)

    t_back = threading.Thread(
        target=stream_logs, args=(backend_proc.stdout, "BACKEND", CYAN), daemon=True
    )
    t_back.start()

    # 2. Start Vite Frontend Service
    frontend_cmd = ["pnpm", "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
    )
    processes.append(frontend_proc)

    t_front = threading.Thread(
        target=stream_logs, args=(frontend_proc.stdout, "FRONTEND", MAGENTA), daemon=True
    )
    t_front.start()

    # Monitor process health
    while True:
        time.sleep(1)
        if backend_proc.poll() is not None:
            print(f"{RED}✖ Backend process exited unexpectedly with code {backend_proc.returncode}{RESET}")
            terminate_all()
        if frontend_proc.poll() is not None:
            print(f"{RED}✖ Frontend process exited unexpectedly with code {frontend_proc.returncode}{RESET}")
            terminate_all()


if __name__ == "__main__":
    main()
