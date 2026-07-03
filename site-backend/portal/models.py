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
