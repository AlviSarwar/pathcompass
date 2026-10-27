from rest_framework import serializers

from .models import Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "level", "target_level", "notes"]

    def validate_name(self, value):
        value = value.strip()
        qs = Skill.objects.filter(user=self.context["request"].user, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You already track this skill.")
        return value


from .models import Application, Project  # noqa: E402


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "github_url", "status", "tech_stack", "notes"]


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "company", "role", "applied_date", "deadline", "status", "link", "notes"]
