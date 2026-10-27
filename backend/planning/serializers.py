from rest_framework import serializers

from .models import Requirement


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = ["id", "name", "required_credits", "done_credits"]

    def validate_name(self, value):
        value = value.strip()
        qs = Requirement.objects.filter(user=self.context["request"].user, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You already have a requirement with this name.")
        return value
