from django.conf import settings
from django.core.validators import MaxValueValidator
from django.db import models


class Skill(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    level = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(100)])
    target_level = models.PositiveSmallIntegerField(default=80, validators=[MaxValueValidator(100)])
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [models.UniqueConstraint(fields=["user", "name"], name="unique_skill_per_user")]

    def __str__(self):
        return f"{self.name} ({self.level}%)"
