from decimal import Decimal as D

import pytest

from academics.engine import (
    CourseResult, apply_retake_policy, gpa, project_cgpa,
    quality_points, round_places, target_analysis,
)


def c(code, credits, gp, order=1, ok=True):
    return CourseResult(code=code, credits=D(str(credits)), grade_point=D(str(gp)),
                        semester_order=order, is_pass=ok)


def test_semester_gpa_is_credit_weighted():
    # (3*4.0 + 3*3.0 + 4*3.5) / 10 = 35 / 10
    assert gpa([c("A", 3, "4.0"), c("B", 3, "3.0"), c("C", 4, "3.5")]) == D("3.50")


def test_quality_points_example():
    # 15 credits at 3.50 = 52.50 quality points
    assert quality_points([c(f"C{i}", 3, "3.5") for i in range(5)]) == D("52.5")


def test_cgpa_is_not_average_of_semester_gpas():
    sem1 = [c("A", 3, "4.0")]                        # GPA 4.0, 3 credits
    sem2 = [c("B", 4, "3.0") for _ in range(3)]      # GPA 3.0, 12 credits
    assert gpa(sem1 + sem2) == D("3.20")             # 48 / 15, NOT (4+3)/2 = 3.50


def test_no_courses_returns_none():
    assert gpa([]) is None


def test_failed_course_counts_as_zero():
    assert gpa([c("A", 3, "4.0"), c("B", 3, "0", ok=False)]) == D("2.00")


def test_rounding_half_up():
    assert gpa([c("A", 2, "3.125")]) == D("3.13")
    assert round_places("2.675", 2) == D("2.68")


RETAKE = [c("MAT101", 3, "3.0", 1), c("CSE101", 3, "0", 1, ok=False), c("CSE101", 3, "4.0", 2)]


def test_retake_latest():
    assert gpa(apply_retake_policy(RETAKE, "latest")) == D("3.50")   # 21 / 6


def test_retake_highest():
    assert gpa(apply_retake_policy(RETAKE, "highest")) == D("3.50")


def test_retake_all():
    assert gpa(apply_retake_policy(RETAKE, "all")) == D("2.33")      # 21 / 9


def test_unknown_policy():
    with pytest.raises(ValueError):
        apply_retake_policy(RETAKE, "magic")


BASE = dict(points=70, gpa_credits=20, earned_credits=20, total_required_credits=40, max_point=4)


def test_target_required_gpa():
    r = target_analysis(target="3.50", **BASE)
    assert r["required_avg_gpa"] == D("3.50")
    assert r["remaining_credits"] == D("20")
    assert r["highest_final_cgpa"] == D("3.75")    # (70 + 80) / 40
    assert r["lowest_final_cgpa"] == D("1.75")     # 70 / 40
    assert r["achievable"]


def test_target_exactly_at_maximum():
    r = target_analysis(target="3.75", **BASE)
    assert r["required_avg_gpa"] == D("4.00") and r["achievable"]


def test_target_impossible():
    r = target_analysis(target="3.80", **BASE)
    assert r["required_avg_gpa"] == D("4.10")
    assert not r["achievable"]


def test_target_zero_remaining():
    r = target_analysis(points=70, gpa_credits=20, earned_credits=20,
                        total_required_credits=20, target="3.5", max_point=4)
    assert r["required_avg_gpa"] is None and r["achievable"]


def test_target_above_scale_raises():
    with pytest.raises(ValueError):
        target_analysis(target="4.5", **BASE)


def test_target_from_scratch():
    r = target_analysis(points=0, gpa_credits=0, earned_credits=0,
                        total_required_credits=120, target="3.5", max_point=4)
    assert r["required_avg_gpa"] == D("3.50") and r["remaining_credits"] == D("120")


def test_target_already_secured():
    r = target_analysis(points=140, gpa_credits=40, earned_credits=40,
                        total_required_credits=120, target="1.0", max_point=4)
    assert r["already_secured"] and r["required_avg_gpa"] == D("0.00")


def test_required_gpa_rounds_up():
    # exact answer is 3.2142857...; must show 3.22, never 3.21
    r = target_analysis(points=10, gpa_credits=3, earned_credits=3,
                        total_required_credits=10, target="3.25", max_point=4)
    assert r["required_avg_gpa"] == D("3.22")


def test_project_cgpa():
    assert project_cgpa(70, 20, 20, "3.0") == D("3.25")
