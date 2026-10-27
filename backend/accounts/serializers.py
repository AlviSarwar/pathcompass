from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password as run_password_rules
from django.db import transaction
from rest_framework import serializers

from .models import StudentProfile
from .profile import ensure_profile

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is taken.")
        return value

    def validate_password(self, value):
        run_password_rules(value)
        return value

    @transaction.atomic
    def create(self, data):
        user = User.objects.create_user(username=data["username"], email=data["email"], password=data["password"])
        ensure_profile(user)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["university", "department", "degree_name", "total_credits_required",
                  "target_cgpa", "retake_policy", "rounding_places", "career_track"]
