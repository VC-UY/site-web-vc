from django.urls import path

from .views import HealthView, InstallGuideView, MissionView, PublicStatsView

urlpatterns = [
    path("health/", HealthView.as_view(), name="api-health"),
    path("stats/", PublicStatsView.as_view(), name="public-stats"),
    path("install-guide/", InstallGuideView.as_view(), name="install-guide"),
    path("mission/", MissionView.as_view(), name="mission"),
]
