import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

HOST_HEADER = "coordinator-vc-uy.npe-techs.com"


def coordinator_get(path: str, timeout: int = 8):
    base = settings.COORDINATOR_API_URL.rstrip("/")
    url = f"{base}/{path.lstrip('/')}"
    try:
        resp = requests.get(
            url,
            timeout=timeout,
            headers={"Host": HOST_HEADER, "Accept": "application/json"},
        )
        if resp.ok:
            return resp.json()
    except Exception as exc:
        logger.warning("Coordinator request failed %s: %s", url, exc)
    return None


def count_by_status(items, status_field="current_status"):
    counts = {}
    for item in items or []:
        if not isinstance(item, dict):
            continue
        status = item.get(status_field) or item.get("status") or "unknown"
        counts[status] = counts.get(status, 0) + 1
    return [{"name": k, "value": v} for k, v in counts.items()]


def build_system_overview():
    health = coordinator_get("system-health/") or {}
    details = health.get("details") or {}
    volunteers = coordinator_get("volunteers/") or []
    tasks = coordinator_get("tasks/") or []
    workflows = coordinator_get("workflows/") or []

    if not isinstance(volunteers, list):
        volunteers = []
    if not isinstance(tasks, list):
        tasks = []
    if not isinstance(workflows, list):
        workflows = []

    completed_tasks = sum(
        1 for t in tasks if isinstance(t, dict) and t.get("status") in ("completed", "COMPLETED", "done")
    )
    running_tasks = sum(
        1 for t in tasks if isinstance(t, dict) and t.get("status") in ("running", "RUNNING", "assigned", "ASSIGNED")
    )
    active_volunteers = sum(
        1
        for v in volunteers
        if isinstance(v, dict) and v.get("current_status") in ("available", "busy")
    )

    return {
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
        "live": bool(health),
    }
