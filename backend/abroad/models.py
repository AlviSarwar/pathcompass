from django.conf import settings
from django.db import models


class Scholarship(models.Model):
    class Status(models.TextChoices):
        RESEARCHING = "researching", "Researching"
        PREPARING = "preparing", "Preparing"
        APPLIED = "applied", "Applied"
        AWARDED = "awarded", "Awarded"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scholarships")
    name = models.CharField(max_length=200)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.RESEARCHING)
    link = models.URLField(max_length=300, blank=True)
    requirements = models.TextField(blank=True)

    class Meta:
        ordering = ["-id"]


class TestScore(models.Model):
    class Exam(models.TextChoices):
        IELTS = "ielts", "IELTS"
        TOEFL = "toefl", "TOEFL"
        GRE = "gre", "GRE"

    class Kind(models.TextChoices):
        MOCK = "mock", "Mock test"
        OFFICIAL = "official", "Official test"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="test_scores")
    exam = models.CharField(max_length=8, choices=Exam.choices)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.MOCK)
    test_date = models.DateField(null=True, blank=True)
    score = models.DecimalField(max_digits=4, decimal_places=1)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-test_date", "-id"]


class Document(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "To do"
        IN_PROGRESS = "in_progress", "In progress"
        READY = "ready", "Ready"
        SUBMITTED = "submitted", "Submitted"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents")
    name = models.CharField(max_length=150)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.TODO)
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["id"]
