from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Requirement(models.Model):
    """One graduation requirement group, e.g. Core 60 credits, Lab 6 credits."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="requirements")
    name = models.CharField(max_length=100)
    required_credits = models.DecimalField(max_digits=5, decimal_places=1, validators=[MinValueValidator(Decimal("0.5"))])
    done_credits = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"),
                                       validators=[MinValueValidator(Decimal("0"))])

    class Meta:
        ordering = ["id"]
