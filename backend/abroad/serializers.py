from decimal import Decimal

from rest_framework import serializers

from .models import Document, Scholarship, TestScore

# exam: (lowest, highest, step)
RANGES = {"ielts": (Decimal("0"), Decimal("9"), Decimal("0.5")),
          "toefl": (Decimal("0"), Decimal("120"), Decimal("1")),
          "gre": (Decimal("260"), Decimal("340"), Decimal("1"))}


class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = ["id", "name", "deadline", "status", "link", "requirements"]


class TestScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestScore
        fields = ["id", "exam", "kind", "test_date", "score", "notes"]

    def validate(self, attrs):
        exam = attrs.get("exam", getattr(self.instance, "exam", None))
        score = attrs.get("score", getattr(self.instance, "score", None))
        if exam and score is not None:
            low, high, step = RANGES[exam]
            if not (low <= score <= high) or score % step != 0:
                raise serializers.ValidationError(
                    {"score": f"{exam.upper()} total score must be {low} to {high} in steps of {step}."})
        return attrs


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "name", "status", "due_date", "notes"]
