import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

HOST_HEADER = "coordinator-vc-uy.npe-techs.com"

_token_cache = {"token": None, "expires_at": 0.0}

# Cache disque des dernieres stats valides (survit aux redemarrages / coupures brieves)
_CACHE_PATH = Path(getattr(settings, "SITE_DB_PATH", "/tmp/site.db")).parent / "stats_cache.json"
_CACHE_MAX_AGE = 6 * 3600  # 6 h


def _coordinator_base() -> str:
    return settings.COORDINATOR_API_URL.rstrip("/")


def _internal_token() -> str:
    return (
        os.environ.get("COORDINATOR_INTERNAL_TOKEN", "")
        or getattr(settings, "COORDINATOR_INTERNAL_TOKEN", "")
        or ""
    ).strip()


def _login_token() -> Optional[str]:
    """Recupere un token dashboard coordinateur (cache 30 min)."""
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now:
        return _token_cache["token"]

    email = os.environ.get("COORDINATOR_ADMIN_EMAIL", "").strip()
    password = os.environ.get("COORDINATOR_ADMIN_PASSWORD", "")
    if not email or not password:
        logger.warning("COORDINATOR_ADMIN_EMAIL/PASSWORD manquants pour les stats publiques")
        return None

    url = f"{_coordinator_base()}/auth/login/"
    try:
        resp = requests.post(
            url,
            json={"email": email, "password": password},
            timeout=8,
            headers={"Host": HOST_HEADER, "Accept": "application/json"},
        )
        if not resp.ok:
            logger.warning("Login coordinateur echoue: HTTP %s %s", resp.status_code, resp.text[:200])
            return None
        token = (resp.json() or {}).get("token")
        if token:
            _token_cache["token"] = token
            _token_cache["expires_at"] = now + 30 * 60
        return token
    except Exception as exc:
        logger.warning("Login coordinateur impossible: %s", exc)
        return None


def _auth_headers(prefer_internal: bool = False) -> dict:
    headers = {"Host": HOST_HEADER, "Accept": "application/json"}
    internal = _internal_token()
    if prefer_internal and internal:
        headers["X-Internal-Token"] = internal
        return headers

    token = _login_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    elif internal:
        headers["X-Internal-Token"] = internal
    return headers


def coordinator_get(path: str, timeout: int = 8):
    base = _coordinator_base()
    url = f"{base}/{path.lstrip('/')}"

    # 1) Token interne (stable) puis 2) login dashboard
    for prefer_internal in (True, False):
        headers = _auth_headers(prefer_internal=prefer_internal)
        if "Authorization" not in headers and "X-Internal-Token" not in headers:
            continue
        try:
            resp = requests.get(url, timeout=timeout, headers=headers)
            if resp.status_code == 401 and not prefer_internal:
                _token_cache["token"] = None
                _token_cache["expires_at"] = 0
                headers = _auth_headers(prefer_internal=False)
                if "Authorization" in headers or "X-Internal-Token" in headers:
                    resp = requests.get(url, timeout=timeout, headers=headers)
            if resp.ok:
                return resp.json()
            logger.warning(
                "Coordinator request failed %s (internal=%s): HTTP %s",
                url,
                prefer_internal,
                resp.status_code,
            )
        except Exception as exc:
            logger.warning("Coordinator request failed %s: %s", url, exc)
    return None


def _as_list(payload: Any) -> list:
    if payload is None:
        return []
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        results = payload.get("results")
        if isinstance(results, list):
            return results
    return []


def count_by_status(items, status_field="current_status"):
    counts = {}
    for item in items or []:
        if not isinstance(item, dict):
            continue
        status = item.get(status_field) or item.get("status") or "unknown"
        counts[status] = counts.get(status, 0) + 1
    return [{"name": k, "value": v} for k, v in counts.items()]


def _load_cache() -> Optional[dict]:
    try:
        if not _CACHE_PATH.exists():
            return None
        data = json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
        if time.time() - float(data.get("_cached_at", 0)) > _CACHE_MAX_AGE:
            return None
        data.pop("_cached_at", None)
        data["live"] = False
        data["from_cache"] = True
        return data
    except Exception as exc:
        logger.warning("Lecture cache stats impossible: %s", exc)
        return None


def _save_cache(overview: dict) -> None:
    try:
        _CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        payload = {**overview, "_cached_at": time.time()}
        _CACHE_PATH.write_text(json.dumps(payload), encoding="utf-8")
    except Exception as exc:
        logger.warning("Ecriture cache stats impossible: %s", exc)


def build_system_overview():
    health = coordinator_get("system-health/") or {}
    details = health.get("details") or {}
    volunteers = _as_list(coordinator_get("volunteers/"))
    tasks = _as_list(coordinator_get("tasks/"))
    workflows = _as_list(coordinator_get("workflows/"))

    has_data = bool(volunteers or tasks or workflows or health.get("status"))

    completed_tasks = sum(
        1 for t in tasks if isinstance(t, dict) and t.get("status") in ("completed", "COMPLETED", "done")
    )
    running_tasks = sum(
        1
        for t in tasks
        if isinstance(t, dict)
        and t.get("status") in ("running", "RUNNING", "assigned", "ASSIGNED", "STARTED", "started")
    )
    active_volunteers = sum(
        1
        for v in volunteers
        if isinstance(v, dict)
        and (
            v.get("is_online") is True
            or (
                v.get("is_online") is not False
                and v.get("current_status") in ("available", "busy", "online", "ONLINE")
            )
        )
    )

    overview = {
        "system_status": health.get("status", "unknown"),
        "database": details.get("database", "unknown"),
        "active_volunteers": active_volunteers,
        "total_volunteers": len(volunteers),
        "total_tasks": len(tasks),
        "completed_tasks": completed_tasks,
        "running_tasks": running_tasks,
        "total_workflows": len(workflows),
        "volunteers_by_status": count_by_status(volunteers, "current_status"),
        "tasks_by_status": count_by_status(tasks, "status"),
        "volunteers_preview": volunteers[:12],
        "updated_at": health.get("timestamp"),
        "live": bool(health) and has_data,
        "from_cache": False,
    }

    # Si le coordinateur repond mais sans donnees auth (tout a zero), utiliser le cache
    if not volunteers and not tasks and not workflows:
        cached = _load_cache()
        if cached and (cached.get("total_volunteers") or cached.get("total_tasks") or cached.get("total_workflows")):
            logger.warning("Stats coordinateur vides — restitution du cache")
            return cached
        return overview

    _save_cache(overview)
    return overview
