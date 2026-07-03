import secrets

from django.contrib.auth.hashers import check_password, make_password

from .models import SiteVolunteer


def hash_password(raw_password: str) -> str:
    return make_password(raw_password)


def verify_password(raw_password: str, password_hash: str) -> bool:
    return check_password(raw_password, password_hash)


def issue_token(volunteer: SiteVolunteer) -> str:
    token = secrets.token_urlsafe(32)
    volunteer.api_token = token
    volunteer.save(update_fields=["api_token"])
    return token


def volunteer_from_token(token: str | None) -> SiteVolunteer | None:
    if not token:
        return None
    return SiteVolunteer.objects.filter(api_token=token).first()
