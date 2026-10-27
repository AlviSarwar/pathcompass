from decimal import Decimal

from .models import GradeBoundary, GradingScale

# A COMMON Bangladesh-style 4.00 scale, used only as an editable default.
# Always check it against your own university's grading policy (Settings page).
DEFAULT_4_00 = [
    ("A+", "4.00", True), ("A", "3.75", True), ("A-", "3.50", True),
    ("B+", "3.25", True), ("B", "3.00", True), ("B-", "2.75", True),
    ("C+", "2.50", True), ("C", "2.25", True), ("D", "2.00", True),
    ("F", "0.00", False),
]


def create_default_scale(user, name="Default 4.00 scale (edit to match your university)"):
    scale = GradingScale.objects.create(owner=user, name=name)
    GradeBoundary.objects.bulk_create(
        GradeBoundary(scale=scale, letter=l, point=Decimal(p), is_pass=ok) for l, p, ok in DEFAULT_4_00
    )
    return scale
