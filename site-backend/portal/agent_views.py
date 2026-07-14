"""
Ingestion télémétrie agent volontaire (ARX+GRU) + export recherche.
"""
from __future__ import annotations

import io
import json
import zipfile
from datetime import datetime, timezone

from django.db.models import Count
from django.http import HttpResponse
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    TelemetryMachine,
    TelemetryPowerEvent,
    TelemetrySession,
    TelemetrySnapshot,
)


def _upsert_machine(data: dict) -> TelemetryMachine:
    machine_id = str(data.get("machine_id") or "").strip()
    if not machine_id:
        raise ValueError("machine_id requis")

    defaults = {
        "volunteer_id": str(data.get("volunteer_id") or ""),
        "hostname": str(data.get("hostname") or ""),
        "os_name": str(data.get("os") or data.get("os_name") or ""),
        "cpu_model": str(data.get("cpu_model") or ""),
        "cpu_cores": int(data.get("cpu_cores") or 0),
        "ram_gb": float(data.get("ram_gb") or 0),
        "disk_total_gb": float(data.get("disk_total_gb") or 0),
        "timezone": str(data.get("timezone") or ""),
        "consent_level": int(data.get("consent_level") or 3),
        "allowed_days": data.get("allowed_days") or [],
        "allowed_slots": data.get("allowed_slots") or [],
        "contrib_mode": str(data.get("contrib_mode") or ""),
    }
    machine, _ = TelemetryMachine.objects.update_or_create(
        machine_id=machine_id, defaults=defaults
    )
    return machine


class AgentRegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            machine = _upsert_machine(request.data or {})
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"status": "ok", "machine_id": machine.machine_id},
            status=status.HTTP_200_OK,
        )


class AgentSessionStartView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        machine_id = str(data.get("machine_id") or "").strip()
        session_id = str(data.get("session_id") or "").strip()
        if not machine_id or not session_id:
            return Response(
                {"detail": "machine_id et session_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        machine, _ = TelemetryMachine.objects.get_or_create(machine_id=machine_id)
        TelemetrySession.objects.update_or_create(
            session_id=session_id,
            defaults={
                "machine": machine,
                "boot_time": str(data.get("boot_time") or ""),
            },
        )
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)


class AgentSyncSnapshotsView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        machine_id = str(data.get("machine_id") or "").strip()
        snapshots = data.get("snapshots") or []
        if not machine_id:
            return Response(
                {"detail": "machine_id requis"}, status=status.HTTP_400_BAD_REQUEST
            )
        if not isinstance(snapshots, list):
            return Response(
                {"detail": "snapshots doit etre une liste"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        machine, _ = TelemetryMachine.objects.get_or_create(machine_id=machine_id)
        if data.get("volunteer_id"):
            machine.volunteer_id = str(data.get("volunteer_id"))
            machine.save(update_fields=["volunteer_id", "last_seen"])

        created = 0
        for snap in snapshots:
            if not isinstance(snap, dict):
                continue
            pred = snap.get("predicted_availability")
            try:
                pred_f = float(pred) if pred is not None else None
            except (TypeError, ValueError):
                pred_f = None
            TelemetrySnapshot.objects.create(
                machine=machine,
                session_id=str(snap.get("session_id") or ""),
                payload=snap,
                predicted_availability=pred_f,
            )
            created += 1

        TelemetryMachine.objects.filter(pk=machine.pk).update(
            snapshot_count=TelemetrySnapshot.objects.filter(machine=machine).count()
        )
        return Response({"status": "ok", "accepted": created})


class AgentSyncPowerEventsView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        machine_id = str(data.get("machine_id") or "").strip()
        if not machine_id:
            return Response(
                {"detail": "machine_id requis"}, status=status.HTTP_400_BAD_REQUEST
            )
        machine, _ = TelemetryMachine.objects.get_or_create(machine_id=machine_id)
        TelemetryPowerEvent.objects.create(
            machine=machine,
            event_type=str(data.get("event_type") or "unknown"),
            gap_s=int(data.get("gap_s") or 0),
            ts_utc=str(data.get("ts_utc") or ""),
        )
        return Response({"status": "ok"})


class TelemetryOverviewView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        machines = TelemetryMachine.objects.all()
        total_snaps = TelemetrySnapshot.objects.count()
        recent = (
            TelemetrySnapshot.objects.select_related("machine")
            .order_by("-collected_at")[:20]
        )
        return Response(
            {
                "machines_count": machines.count(),
                "snapshots_count": total_snaps,
                "power_events_count": TelemetryPowerEvent.objects.count(),
                "machines": [
                    {
                        "machine_id": m.machine_id,
                        "hostname": m.hostname,
                        "os": m.os_name,
                        "cpu_model": m.cpu_model,
                        "cpu_cores": m.cpu_cores,
                        "ram_gb": m.ram_gb,
                        "snapshot_count": m.snapshot_count,
                        "last_seen": m.last_seen.isoformat() if m.last_seen else None,
                        "volunteer_id": m.volunteer_id,
                    }
                    for m in machines[:100]
                ],
                "recent_snapshots": [
                    {
                        "machine_id": s.machine.machine_id,
                        "hostname": s.machine.hostname,
                        "volunteer_id": s.machine.volunteer_id,
                        "predicted_availability": s.predicted_availability,
                        "collected_at": s.collected_at.isoformat(),
                        "hybrid": (s.payload.get("prediction_detail") or {}).get(
                            "hybrid"
                        ),
                        "launch": (s.payload.get("prediction_detail") or {}).get(
                            "launch"
                        ),
                        "prediction_detail": s.payload.get("prediction_detail") or {},
                    }
                    for s in recent
                ],
            }
        )


class TelemetryLastPredictionView(APIView):
    """Dernière prediction_detail pour un volontaire (fallback coordinateur)."""

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        vid = (request.query_params.get("volunteer_id") or "").strip()
        mid = (request.query_params.get("machine_id") or "").strip()
        qs = TelemetrySnapshot.objects.select_related("machine").order_by(
            "-collected_at"
        )
        if vid:
            qs = qs.filter(machine__volunteer_id=vid)
        elif mid:
            qs = qs.filter(machine__machine_id=mid)
        else:
            return Response(
                {"ok": False, "detail": "volunteer_id ou machine_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        snap = qs.first()
        if not snap:
            return Response({"ok": False, "detail": "aucune prediction"}, status=404)
        detail = snap.payload.get("prediction_detail") or {}
        if not detail and snap.predicted_availability is not None:
            detail = {
                "hybrid": snap.predicted_availability,
                "linear": snap.predicted_availability,
                "gru": snap.predicted_availability,
                "launch": float(snap.predicted_availability) >= 0.32,
                "horizon_min": 15,
                "launch_threshold": 0.32,
                "label": "stay_soft_15m",
            }
        return Response(
            {
                "ok": True,
                "volunteer_id": snap.machine.volunteer_id,
                "machine_id": snap.machine.machine_id,
                "hostname": snap.machine.hostname,
                "collected_at": snap.collected_at.isoformat(),
                "predicted_availability": snap.predicted_availability,
                "prediction_detail": detail,
            }
        )


class TelemetryExportZipView(APIView):
    """Télécharge un ZIP JSONL des snapshots (recherche scientifique)."""

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        machine_id = (request.query_params.get("machine_id") or "").strip()
        qs = TelemetrySnapshot.objects.select_related("machine").order_by("collected_at")
        if machine_id:
            qs = qs.filter(machine__machine_id=machine_id)

        buf = io.BytesIO()
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            meta = {
                "exported_at": stamp,
                "source": "VolunSys-UY1 public site",
                "license_note": (
                    "Donnees de telesmetrie volontaire anonymisees au niveau machine_id. "
                    "Usage recherche scientifique. Pas de contenu personnel utilisateur."
                ),
                "machines": list(
                    TelemetryMachine.objects.values(
                        "machine_id",
                        "hostname",
                        "os_name",
                        "cpu_model",
                        "cpu_cores",
                        "ram_gb",
                        "snapshot_count",
                        "consent_level",
                    )
                ),
                "snapshot_count": qs.count(),
            }
            zf.writestr("README.json", json.dumps(meta, indent=2, ensure_ascii=False))

            # machines.csv
            lines = ["machine_id,hostname,os,cpu_cores,ram_gb,snapshot_count,last_seen"]
            for m in TelemetryMachine.objects.all():
                lines.append(
                    ",".join(
                        [
                            m.machine_id,
                            json.dumps(m.hostname),
                            json.dumps(m.os_name),
                            str(m.cpu_cores),
                            str(m.ram_gb),
                            str(m.snapshot_count),
                            m.last_seen.isoformat() if m.last_seen else "",
                        ]
                    )
                )
            zf.writestr("machines.csv", "\n".join(lines))

            # snapshots.jsonl (stream in chunks)
            chunk = []
            idx = 0
            file_idx = 0

            def flush():
                nonlocal chunk, file_idx
                if not chunk:
                    return
                zf.writestr(
                    f"snapshots/part_{file_idx:04d}.jsonl",
                    "\n".join(chunk),
                )
                file_idx += 1
                chunk = []

            for s in qs.iterator(chunk_size=500):
                row = {
                    "machine_id": s.machine.machine_id,
                    "session_id": s.session_id,
                    "collected_at": s.collected_at.isoformat(),
                    "predicted_availability": s.predicted_availability,
                    "payload": s.payload,
                }
                chunk.append(json.dumps(row, ensure_ascii=False, default=str))
                idx += 1
                if len(chunk) >= 2000:
                    flush()
            flush()

        buf.seek(0)
        filename = f"vcuy-telemetry-{stamp}.zip"
        if machine_id:
            filename = f"vcuy-telemetry-{machine_id[:12]}-{stamp}.zip"
        resp = HttpResponse(buf.getvalue(), content_type="application/zip")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        return resp
