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
]
