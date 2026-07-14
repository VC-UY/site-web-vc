from django.urls import path

from .views import (
    AnalyticsView,
    BadgesView,
    HealthView,
    InstallGuideView,
    MissionView,
    PublicStatsView,
    SystemOverviewView,
    VolunteerLoginView,
    VolunteerMeView,
    VolunteerRegisterView,
    VolunteersListView,
)
from .agent_views import (
    AgentRegisterView,
    AgentSessionStartView,
    AgentSyncPowerEventsView,
    AgentSyncSnapshotsView,
    TelemetryExportZipView,
    TelemetryLastPredictionView,
    TelemetryOverviewView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="api-health"),
    path("overview/", SystemOverviewView.as_view(), name="system-overview"),
    path("stats/", PublicStatsView.as_view(), name="public-stats"),
    path("analytics/", AnalyticsView.as_view(), name="analytics"),
    path("volunteers/", VolunteersListView.as_view(), name="volunteers-list"),
    path("mission/", MissionView.as_view(), name="mission"),
    path("badges/", BadgesView.as_view(), name="badges"),
    path("volunteers/register/", VolunteerRegisterView.as_view(), name="volunteer-register"),
    path("volunteers/login/", VolunteerLoginView.as_view(), name="volunteer-login"),
    path("volunteers/me/", VolunteerMeView.as_view(), name="volunteer-me"),
    path("install-guide/", InstallGuideView.as_view(), name="install-guide"),
    # Agent télémétrie / recherche (compat syncer agent/)
    path("agent/register", AgentRegisterView.as_view(), name="agent-register"),
    path("agent/register/", AgentRegisterView.as_view()),
    path("agent/sessions/start", AgentSessionStartView.as_view(), name="agent-session-start"),
    path("agent/sessions/start/", AgentSessionStartView.as_view()),
    path("agent/sync/snapshots", AgentSyncSnapshotsView.as_view(), name="agent-sync-snapshots"),
    path("agent/sync/snapshots/", AgentSyncSnapshotsView.as_view()),
    path("agent/sync/power-events", AgentSyncPowerEventsView.as_view(), name="agent-sync-power"),
    path("agent/sync/power-events/", AgentSyncPowerEventsView.as_view()),
    path("telemetry/", TelemetryOverviewView.as_view(), name="telemetry-overview"),
    path(
        "telemetry/last-prediction/",
        TelemetryLastPredictionView.as_view(),
        name="telemetry-last-prediction",
    ),
    path(
        "telemetry/last-prediction",
        TelemetryLastPredictionView.as_view(),
    ),
    path("telemetry/export.zip", TelemetryExportZipView.as_view(), name="telemetry-export-zip"),
]
