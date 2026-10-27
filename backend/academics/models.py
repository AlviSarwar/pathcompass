from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class GradingScale(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="grading_scales")
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.owner})"


class GradeBoundary(models.Model):
    scale = models.ForeignKey(GradingScale, on_delete=models.CASCADE, related_name="boundaries")
    letter = models.CharField(max_length=3)
    point = models.DecimalField(max_digits=3, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    is_pass = models.BooleanField(default=True)

    class Meta:
        ordering = ["-point", "letter"]
        constraints = [
            models.UniqueConstraint(fields=["scale", "letter"], name="unique_letter_per_scale"),
            models.CheckConstraint(condition=models.Q(point__gte=0), name="point_not_negative"),
        ]

    def __str__(self):
        return f"{self.letter} = {self.point}"


class Semester(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="semesters")
    name = models.CharField(max_length=60)
    order = models.PositiveIntegerField()          # 1 = first semester
    is_planned = models.BooleanField(default=False)  # planned = future, not counted in CGPA

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["user", "order"], name="unique_semester_order_per_user"),
            models.UniqueConstraint(fields=["user", "name"], name="unique_semester_name_per_user"),
        ]

    def __str__(self):
        return self.name


class Course(models.Model):
    """One ROW = one ATTEMPT. A retake is the same code in a later semester."""

    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        PLANNED = "planned", "Planned"
        WITHDRAWN = "withdrawn", "Withdrawn"
        INCOMPLETE = "incomplete", "Incomplete"

    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name="courses")
    code = models.CharField(max_length=20)
    title = models.CharField(max_length=150, blank=True)
    credits = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(Decimal("0.5"))])
    letter_grade = models.CharField(max_length=3, blank=True)
    grade_point = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    is_pass = models.BooleanField(default=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.COMPLETED)

    class Meta:
        ordering = ["semester__order", "code"]
        constraints = [
            models.UniqueConstraint(fields=["semester", "code"], name="unique_course_per_semester"),
            models.CheckConstraint(condition=models.Q(credits__gt=0), name="credits_positive"),
        ]

    def __str__(self):
        return f"{self.code} ({self.letter_grade or '-'})"
