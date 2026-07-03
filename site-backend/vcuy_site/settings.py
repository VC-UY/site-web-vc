import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-change-in-production")
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() in ("1", "true", "yes")
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,vc-uy.npe-techs.com",
    ).split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "portal",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "vcuy_site.urls"
WSGI_APPLICATION = "vcuy_site.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Douala"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,https://vc-uy.npe-techs.com",
    ).split(",")
    if o.strip()
]

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

COORDINATOR_API_URL = os.environ.get(
    "COORDINATOR_API_URL", "http://coordinator-api:8001/api"
)
MANAGER_PUBLIC_URL = os.environ.get(
    "MANAGER_PUBLIC_URL", "https://manager-vc-uy.npe-techs.com"
)
VOLUNTEER_REPO_URL = os.environ.get(
    "VOLUNTEER_REPO_URL", "https://github.com/VC-UY/volunteer-app-2025"
)
COORDINATOR_REDIS_HOST = os.environ.get("COORDINATOR_REDIS_HOST", "173.249.38.251")
REDIS_PROXY_PORT = os.environ.get("REDIS_PROXY_PORT", "6380")
