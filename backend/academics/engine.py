"""CGPA engine: pure Python, no database.
Every academic number shown in the app comes from here, never from an AI model.
"""
from dataclasses import dataclass
from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal

ZERO = Decimal("0")


def to_decimal(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value))


def _step(places: int) -> Decimal:
    return Decimal(1).scaleb(-places)


def round_places(value, places: int = 2) -> Decimal:
    """Round half up (3.125 -> 3.13), the way people expect."""
    return to_decimal(value).quantize(_step(places), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class CourseResult:
    code: str
    credits: Decimal
    grade_point: Decimal
    semester_order: int = 0
    is_pass: bool = True
    semester_id: int = 0
    letter: str = ""


def quality_points(courses) -> Decimal:
    return sum((c.credits * c.grade_point for c in courses), ZERO)


def total_credits(courses) -> Decimal:
    return sum((c.credits for c in courses), ZERO)


def gpa(courses, places: int = 2):
    """Credit-weighted GPA/CGPA. Returns None when there are no credits."""
    courses = list(courses)
    credits = total_credits(courses)
    if credits == 0:
        return None
    return round_places(quality_points(courses) / credits, places)


def apply_retake_policy(courses, policy: str = "latest"):
    """Decide which attempts count when the same course code appears twice.
    latest  = newest attempt replaces older ones
    highest = best grade counts
    all     = every attempt counts
    """
    courses = list(courses)
    if policy == "all":
        return courses
    if policy not in ("latest", "highest"):
        raise ValueError(f"Unknown retake policy: {policy}")
    groups: dict[str, list[CourseResult]] = {}
    for c in courses:
        groups.setdefault(c.code.strip().upper(), []).append(c)
    key = (lambda c: c.semester_order) if policy == "latest" else (lambda c: c.grade_point)
    return [max(attempts, key=key) for attempts in groups.values()]


def project_cgpa(points, gpa_credits, future_credits, future_gpa, places: int = 2):
    """Illustrative what-if: CGPA if future credits average `future_gpa`."""
    points, gpa_credits, future_credits, future_gpa = map(
        to_decimal, (points, gpa_credits, future_credits, future_gpa)
    )
    final_credits = gpa_credits + future_credits
    if final_credits == 0:
        return None
    return round_places((points + future_gpa * future_credits) / final_credits, places)


def target_analysis(*, points, gpa_credits, earned_credits, target,
                    total_required_credits, max_point, min_point=ZERO, places: int = 2):
    """Can the student reach `target`, and what average GPA is needed?

    Assumes every remaining credit will count in the CGPA at the grade earned.
    Required GPA is rounded UP so we never understate what is needed.
    """
    points, gpa_credits, earned_credits, target, total_required_credits, max_point, min_point = map(
        to_decimal,
        (points, gpa_credits, earned_credits, target, total_required_credits, max_point, min_point),
    )
    if not (ZERO <= target <= max_point):
        raise ValueError("Target must be between 0 and the highest grade point.")

    current = points / gpa_credits if gpa_credits > 0 else None
    remaining = max(total_required_credits - earned_credits, ZERO)

    if remaining == 0:
        cur = round_places(current, places) if current is not None else None
        met = cur is not None and cur >= target
        return {
            "current_cgpa": cur, "remaining_credits": ZERO, "final_credits": gpa_credits,
            "required_avg_gpa": None, "achievable": met, "already_secured": met,
            "highest_final_cgpa": cur, "lowest_final_cgpa": cur,
        }

    final_credits = gpa_credits + remaining
    required = (target * final_credits - points) / remaining
    return {
        "current_cgpa": round_places(current, places) if current is not None else None,
        "remaining_credits": remaining,
        "final_credits": final_credits,
        "required_avg_gpa": max(required, ZERO).quantize(_step(places), rounding=ROUND_CEILING),
        "achievable": required <= max_point,
        "already_secured": required <= min_point,
        "highest_final_cgpa": round_places((points + max_point * remaining) / final_credits, places),
        "lowest_final_cgpa": round_places((points + min_point * remaining) / final_credits, places),
    }
