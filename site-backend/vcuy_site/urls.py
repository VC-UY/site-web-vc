from django.urls import include, path

urlpatterns = [
    path("api/", include("portal.urls")),
    path("health/", include("portal.urls_health")),
]
