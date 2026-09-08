#!/usr/bin/env python3
"""Keep the free-tier Render service awake.

Render free instances sleep after ~15 min of inactivity and take 30-60 s to
cold-start. Ping /health every 8 minutes from anywhere with network access:

    python3 keepalive.py
    # or in cron:
    */8 * * * * /usr/bin/python3 /path/to/fluxpay/scripts/keepalive.py

Optional env overrides:
    FLUXPAY_HEALTH_URL   default https://fluxpay-backend.onrender.com/health
    FLUXPAY_PING_MS      default 480000 ms (8 min) between hits
"""

from __future__ import annotations

import os
import sys
import time
import urllib.request

HEALTH_URL = os.environ.get(
    "FLUXPAY_HEALTH_URL", "https://fluxpay-backend.onrender.com/health"
)
PING_MS = int(os.environ.get("FLUXPAY_PING_MS", 480_000))
TIMEOUT_S = 20
MAX_MISSES = 5


def ping() -> int:
    try:
        with urllib.request.urlopen(HEALTH_URL, timeout=TIMEOUT_S) as resp:
            return resp.status
    except Exception as exc:  # noqa: BLE001 - report and retry
        print(f"[{time.strftime('%H:%M:%S')}] {type(exc).__name__}: {exc}", flush=True)
        return 0


def main() -> int:
    misses = 0
    print(f"keepalive -> {HEALTH_URL} every {PING_MS / 1000:.0f}s", flush=True)
    while misses < MAX_MISSES:
        code = ping()
        if code == 200:
            misses = 0
            print(f"[{time.strftime('%H:%M:%S')}] healthy (200)", flush=True)
        else:
            misses += 1
            print(
                f"[{time.strftime('%H:%M:%S')}] unhealthy (got {code or 'conn error'}, "
                f"miss {misses}/{MAX_MISSES})",
                flush=True,
            )
        time.sleep(PING_MS / 1000)
    print("too many misses — exiting nonzero, alert someone", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())