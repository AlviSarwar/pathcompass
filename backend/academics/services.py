from collections import Counter
from decimal import Decimal

from .engine import (ZERO, CourseResult, apply_retake_policy, gpa, project_cgpa,
                     quality_points, target_analysis, total_credits)
from .models import Course, Semester

POLICY_TEXT = {
    "latest": "a retaken course uses only its latest attempt",
    "highest": "a retaken course uses its highest grade",
    "all": "every attempt counts, including retakes",
}


def f(value):
    return None if value is None else float(value)


def scale_limits(profile):
    points = list(profile.grading_scale.boundaries.values_list("point", flat=True))
    return max(points), min(points)


def completed_results(user):
    rows = Course.objects.filter(
        semester__user=user, semester__is_planned=False,
        status="completed", grade_point__isnull=False,
    ).select_related("semester")
    return [
        CourseResult(code=c.code, credits=c.credits, grade_point=c.grade_point,
                     semester_order=c.semester.order, is_pass=c.is_pass,
                     semester_id=c.semester_id, letter=c.letter_grade)
        for c in rows
    ]


def recalculate_grade_points(profile):
    """After the grading scale changes, refresh every saved course."""
    lookup = {b.letter.upper(): b for b in profile.grading_scale.boundaries.all()}
    for c in Course.objects.filter(semester__user=profile.user).exclude(letter_grade=""):
        b = lookup.get(c.letter_grade.upper())
        c.grade_point = b.point if b else None
        c.is_pass = b.is_pass if b else True
        c.save(update_fields=["grade_point", "is_pass"])


def build_dashboard(profile):
    user, places, policy = profile.user, profile.rounding_places, profile.retake_policy
    max_point, _ = scale_limits(profile)
    results = completed_results(user)
    counted = apply_retake_policy(results, policy)

    earned = sum((r.credits for r in counted if r.is_pass), ZERO)
    attempted = total_credits(counted)
    required = profile.total_credits_required

    rows = []
    for s in Semester.objects.filter(user=user, is_planned=False):
        own = [r for r in results if r.semester_id == s.id]
        upto = apply_retake_policy([r for r in results if r.semester_order <= s.order], policy)
        rows.append({"id": s.id, "name": s.name, "order": s.order, "gpa": f(gpa(own, places)),
                     "credits": f(total_credits(own)), "cgpa": f(gpa(upto, places))})
    graded = [r for r in rows if r["gpa"] is not None]
    best = max(graded, key=lambda r: r["gpa"], default=None)
    worst = min(graded, key=lambda r: r["gpa"], default=None)

    warnings = []
    unmatched = Course.objects.filter(semester__user=user, semester__is_planned=False,
                                      status="completed", grade_point__isnull=True).count()
    if unmatched:
        warnings.append(f"{unmatched} completed course(s) have no valid grade and are excluded. "
                        "Check the letter against your grading scale.")
    if not results:
        warnings.append("No completed graded courses yet, so there is no CGPA to show.")
    if attempted and earned < attempted:
        warnings.append("Some attempted credits are failed and not earned. They still count in CGPA "
                        "under your retake rule.")

    explanation = (
        f"CGPA = total quality points / total credits, where quality points = credits x grade point. "
        f"Here: {quality_points(counted)} / {attempted}. Retake rule: {POLICY_TEXT[policy]}. "
        f"Planned semesters and planned grades are never counted."
    )
    return {
        "cgpa": f(gpa(counted, places)), "target_cgpa": f(profile.target_cgpa), "max_point": f(max_point),
        "credits_attempted": f(attempted), "credits_earned": f(earned),
        "credits_remaining": f(max(required - earned, ZERO)), "total_credits_required": f(required),
        "completed_semesters": len(graded),
        "best_semester": {"name": best["name"], "gpa": best["gpa"]} if best else None,
        "lowest_semester": {"name": worst["name"], "gpa": worst["gpa"]} if worst else None,
        "semesters": rows,
        "grade_distribution": dict(Counter(r.letter for r in counted)),
        "warnings": warnings, "explanation": explanation,
    }


def build_target(profile, target):
    places = profile.rounding_places
    max_point, min_point = scale_limits(profile)
    counted = apply_retake_policy(completed_results(profile.user), profile.retake_policy)
    points, credits = quality_points(counted), total_credits(counted)
    earned = sum((r.credits for r in counted if r.is_pass), ZERO)

    a = target_analysis(points=points, gpa_credits=credits, earned_credits=earned, target=target,
                        total_required_credits=profile.total_credits_required,
                        max_point=max_point, min_point=min_point, places=places)

    scenarios = []
    if a["remaining_credits"] > 0:
        for g in ("3.00", "3.40", "3.70"):   # illustrative, NOT predictions
            if Decimal(g) <= max_point:
                final = project_cgpa(points, credits, a["remaining_credits"], g, places)
                scenarios.append({"future_gpa": float(g), "final_cgpa": f(final),
                                  "meets_target": final >= Decimal(str(target))})

    if a["remaining_credits"] == 0:
        message = (f"You have no credits remaining. Your final CGPA is {a['current_cgpa']}, so the target "
                   f"{'is met' if a['achievable'] else 'is not met'}.")
    elif a["already_secured"]:
        message = "Your target is already secured, even with the lowest possible grades in the remaining credits."
    elif not a["achievable"]:
        message = (f"Not mathematically achievable. You would need an average of {a['required_avg_gpa']} over the "
                   f"remaining {a['remaining_credits']} credits, but the highest grade point is {max_point}. "
                   f"The best final CGPA you can reach is {a['highest_final_cgpa']}.")
    else:
        message = (f"You need an average GPA of {a['required_avg_gpa']} over the remaining "
                   f"{a['remaining_credits']} credits to finish with {target}.")

    return {
        "target_cgpa": float(target), "current_cgpa": f(a["current_cgpa"]),
        "remaining_credits": f(a["remaining_credits"]), "required_avg_gpa": f(a["required_avg_gpa"]),
        "achievable": a["achievable"], "already_secured": a["already_secured"],
        "highest_final_cgpa": f(a["highest_final_cgpa"]), "lowest_final_cgpa": f(a["lowest_final_cgpa"]),
        "max_grade_point": f(max_point), "scenarios": scenarios, "message": message,
    }
