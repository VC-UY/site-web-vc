def compute_points(volunteer: dict) -> int:
    perf = volunteer.get("performance") or {}
    completed = int(perf.get("tasks_completed", 0))
    total = int(perf.get("tasks_total", 0))
    status = volunteer.get("current_status", "offline")

    points = completed * 100 + total * 25
    if status == "available":
        points += 50
    elif status == "busy":
        points += 30
    if volunteer.get("gpu_available"):
        points += 20
    cores = int(volunteer.get("cpu_cores", 0) or 0)
    points += min(cores * 5, 40)
    return points


def compute_badges(volunteer: dict, points: int) -> list[str]:
    perf = volunteer.get("performance") or {}
    completed = int(perf.get("tasks_completed", 0))
    status = volunteer.get("current_status", "offline")
    trust = float(perf.get("trust_score", 0) or 0)

    badges = []
    if status in ("available", "busy") or completed >= 1:
        badges.append("first-step")
    if completed >= 5:
        badges.append("regular")
    if completed >= 3:
        badges.append("science")
    if trust >= 80 and completed >= 10:
        badges.append("reliable")
    if points >= 500:
        badges.append("community")
    if completed >= 20:
        badges.append("ambassador")
    return badges
