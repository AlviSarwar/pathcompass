"""Phase 2 calculations: retake impact, safe zone, credit planner. Numbers come from here, not from AI."""
from decimal import Decimal
from math import ceil

from .engine import ZERO, CourseResult, apply_retake_policy, gpa, round_places, to_decimal
from .models import Semester
from .services import completed_results, f, scale_limits

WARNING_BUFFER = Decimal("0.25")   # within this of the probation line = "warning"


def retake_impact(results, policy, new_point, places=2):
    """For each retake candidate, the CGPA if it were retaken at `new_point`. Biggest gain first.
    The retake is simulated as a new, later attempt, so it follows your retake policy.
    """
    results = list(results)
    if not results:
        return []
    new_point = to_decimal(new_point)
    base = gpa(apply_retake_policy(results, policy), 6)
    next_order = max(r.semester_order for r in results) + 1
    candidates = apply_retake_policy(results, "highest" if policy == "highest" else "latest")
    rows = []
    for c in candidates:
        if c.grade_point >= new_point:
            continue
        attempt = CourseResult(code=c.code, credits=c.credits, grade_point=new_point,
                               semester_order=next_order, is_pass=True)
        new = gpa(apply_retake_policy(results + [attempt], policy), 6)
        gain = new - base
        if gain <= 0:
            continue
        rows.append({
            "code": c.code, "credits": float(c.credits), "current_letter": c.letter,
            "current_point": float(c.grade_point),
            "new_cgpa": float(round_places(new, places)), "gain": float(round_places(gain, places)),
            "_raw_gain": gain,
        })
    rows.sort(key=lambda r: r["_raw_gain"], reverse=True)
    for r in rows:
        del r["_raw_gain"]
    return rows


def safe_zone(cgpa, probation, deans):
    probation, deans = to_decimal(probation), to_decimal(deans)
    if cgpa is None:
        return {"status": "no_data", "message": "Add graded courses to see your safe zone.",
                "margin_to_probation": None, "gap_to_deans": None}
    cgpa = to_decimal(cgpa)
    margin, gap = cgpa - probation, deans - cgpa
    if cgpa < probation:
        status, msg = "probation", f"Your CGPA is {abs(margin)} below your probation line of {probation}."
    elif cgpa < probation + WARNING_BUFFER:
        status, msg = "warning", f"Close to the probation line: only {margin} above {probation}."
    elif cgpa >= deans:
        status, msg = "deans_list", f"At or above your Dean's List line of {deans}."
    else:
        status, msg = "safe", f"Safe: {margin} above probation. {gap} more CGPA to reach {deans}."
    msg += " (Checked against CGPA. Your university may use semester GPA, so verify its rules.)"
    return {"status": status, "message": msg, "margin_to_probation": float(round_places(margin)),
            "gap_to_deans": float(round_places(max(gap, ZERO)))}


def build_safe_zone(profile):
    max_point, _ = scale_limits(profile)
    counted = apply_retake_policy(completed_results(profile.user), profile.retake_policy)
    cgpa = gpa(counted, profile.rounding_places)
    return {"cgpa": f(cgpa), "probation_cgpa": f(profile.probation_cgpa),
            "deans_list_cgpa": f(profile.deans_list_cgpa), "max_point": f(max_point),
            **safe_zone(cgpa, profile.probation_cgpa, profile.deans_list_cgpa)}


def build_retake_impact(profile, new_point):
    results = completed_results(profile.user)
    places = profile.rounding_places
    base = gpa(apply_retake_policy(results, profile.retake_policy), places)
    return {"base_cgpa": f(base), "grade_point": float(new_point), "policy": profile.retake_policy,
            "items": retake_impact(results, profile.retake_policy, new_point, places)}


def build_credit_plan(profile):
    limit = profile.max_credits_per_semester
    rows = []
    for s in Semester.objects.filter(user=profile.user):
        credits = sum((c.credits for c in s.courses.exclude(status="withdrawn")), ZERO)
        if credits > limit:
            status, msg = "over", f"{credits} credits is above your limit of {limit}."
        elif credits == 0:
            status, msg = "empty", "No courses yet."
        else:
            status, msg = "ok", "Within your limit."
        rows.append({"id": s.id, "name": s.name, "order": s.order, "is_planned": s.is_planned,
                     "credits": float(credits), "status": status, "message": msg})
    counted = apply_retake_policy(completed_results(profile.user), profile.retake_policy)
    earned = sum((r.credits for r in counted if r.is_pass), ZERO)
    remaining = max(profile.total_credits_required - earned, ZERO)
    return {"max_per_semester": float(limit), "semesters": rows, "remaining_credits": float(remaining),
            "min_semesters_needed": ceil(remaining / limit) if remaining > 0 else 0}
