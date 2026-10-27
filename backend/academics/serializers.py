from rest_framework import serializers

from accounts.profile import ensure_profile

from .models import Course, GradeBoundary, GradingScale, Semester


class BoundarySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeBoundary
        fields = ["letter", "point", "is_pass"]


class ScaleSerializer(serializers.ModelSerializer):
    boundaries = BoundarySerializer(many=True, read_only=True)
    max_point = serializers.SerializerMethodField()

    class Meta:
        model = GradingScale
        fields = ["id", "name", "max_point", "boundaries"]

    def get_max_point(self, obj):
        return float(max((b.point for b in obj.boundaries.all()), default=0))


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "name", "order", "is_planned"]

    def validate(self, attrs):
        qs = Semester.objects.filter(user=self.context["request"].user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if "name" in attrs and qs.filter(name__iexact=attrs["name"]).exists():
            raise serializers.ValidationError({"name": "You already have a semester with this name."})
        if "order" in attrs and qs.filter(order=attrs["order"]).exists():
            raise serializers.ValidationError({"order": "You already have a semester with this order number."})
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "semester", "code", "title", "credits", "letter_grade", "grade_point", "is_pass", "status"]
        read_only_fields = ["grade_point", "is_pass"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # A user can only attach courses to their OWN semesters.
            self.fields["semester"].queryset = Semester.objects.filter(user=request.user)

    def validate_code(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        inst = self.instance
        status = attrs.get("status", getattr(inst, "status", "completed"))
        letter = attrs.get("letter_grade", getattr(inst, "letter_grade", "")).strip().upper()
        attrs["letter_grade"] = letter
        if status == "completed" and not letter:
            raise serializers.ValidationError({"letter_grade": "A completed course needs a letter grade."})
        if letter:
            profile = ensure_profile(self.context["request"].user)
            b = profile.grading_scale.boundaries.filter(letter__iexact=letter).first()
            if b is None:
                raise serializers.ValidationError({"letter_grade": f"'{letter}' is not in your grading scale."})
            attrs["grade_point"], attrs["is_pass"] = b.point, b.is_pass
        else:
            attrs["grade_point"], attrs["is_pass"] = None, True
        return attrs
