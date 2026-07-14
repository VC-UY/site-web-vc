from django.db import models


class SiteVolunteer(models.Model):
    pseudonym = models.CharField(max_length=80, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    api_token = models.CharField(max_length=64, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.pseudonym


class TelemetryMachine(models.Model):
    """Machine volontaire contribuant des snapshots pour la recherche."""

    machine_id = models.CharField(max_length=128, unique=True, db_index=True)
    volunteer_id = models.CharField(max_length=64, blank=True, db_index=True)
    hostname = models.CharField(max_length=255, blank=True)
    os_name = models.CharField(max_length=64, blank=True)
    cpu_model = models.CharField(max_length=255, blank=True)
    cpu_cores = models.IntegerField(default=0)
    ram_gb = models.FloatField(default=0)
    disk_total_gb = models.FloatField(default=0)
    timezone = models.CharField(max_length=64, blank=True)
    consent_level = models.IntegerField(default=3)
    allowed_days = models.JSONField(default=list, blank=True)
    allowed_slots = models.JSONField(default=list, blank=True)
    contrib_mode = models.CharField(max_length=32, blank=True)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    snapshot_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-last_seen"]

    def __str__(self):
        return self.hostname or self.machine_id


class TelemetrySession(models.Model):
    session_id = models.CharField(max_length=64, unique=True)
    machine = models.ForeignKey(
        TelemetryMachine, on_delete=models.CASCADE, related_name="sessions"
    )
    boot_time = models.CharField(max_length=64, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-started_at"]


class TelemetrySnapshot(models.Model):
    machine = models.ForeignKey(
        TelemetryMachine, on_delete=models.CASCADE, related_name="snapshots"
    )
    session_id = models.CharField(max_length=64, blank=True, db_index=True)
    payload = models.JSONField(default=dict)
    predicted_availability = models.FloatField(null=True, blank=True)
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-collected_at"]
        indexes = [
            models.Index(fields=["machine", "-collected_at"]),
        ]


class TelemetryPowerEvent(models.Model):
    machine = models.ForeignKey(
        TelemetryMachine, on_delete=models.CASCADE, related_name="power_events"
    )
    event_type = models.CharField(max_length=64)
    gap_s = models.IntegerField(default=0)
    ts_utc = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
