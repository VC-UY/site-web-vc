from rest_framework import serializers

from .models import SiteVolunteer


class VolunteerRegisterSerializer(serializers.Serializer):
    pseudonym = serializers.CharField(min_length=3, max_length=80)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)


class VolunteerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True)


class SiteVolunteerPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVolunteer
        fields = ("pseudonym", "email", "created_at")
