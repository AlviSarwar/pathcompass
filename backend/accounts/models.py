from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class StudentProfile(models.Model):
    class RetakePolicy(models.TextChoices):
        LATEST = "latest", "Latest attempt replaces the old grade"
        HIGHEST = "highest", "Highest grade counts"
        ALL = "all", "All attempts count"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    university = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    degree_name = models.CharField(max_length=150, blank=True)
    # Default 140 is only a starting guess. The student must set their real number.
    total_credits_required = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("140"),
                                                 validators=[MinValueValidator(Decimal("1"))])
    target_cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("3.50"))
    grading_scale = models.ForeignKey("academics.GradingScale", null=True, blank=True,
                                      on_delete=models.SET_NULL, related_name="+")
    retake_policy = models.CharField(max_length=10, choices=RetakePolicy.choices, default=RetakePolicy.LATEST)
    rounding_places = models.PositiveSmallIntegerField(default=2, validators=[MaxValueValidator(4)])
    career_track = models.CharField(max_length=60, blank=True)
    probation_cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("2.00"))
    deans_list_cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("3.50"))
    max_credits_per_semester = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal("18"),
                                                   validators=[MinValueValidator(Decimal("1"))])
    is_demo = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user}"

