import os
from pathlib import Path

UPLOADS_DIR = Path(os.environ.get("UPLOADS_DIR", "uploads"))


def resolve_uploads_dir() -> Path:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOADS_DIR
