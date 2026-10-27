from decimal import Decimal as D

import pytest
from rest_framework.test import APIClient

from academics.engine import CourseResult
from academics.insights import retake_impact, safe_zone
from academics.test_api import add_course, add_semester, make_client


def c(code, credits, gp, order=1):
    return CourseResult(code=code, credits=D(str(credits)), grade_point=D(str(gp)), semester_order=order)


def test_retake_impact_ranks_biggest_gain_first():
    rows = retake_impact([c("MAT101", 3, "3.00"), c("CSE101", 3, "2.25")], "latest", D("4.00"))
    assert [r["code"] for r in rows] == ["CSE101", "MAT101"]
    assert rows[0]["new_cgpa"] == 3.5          # (12 + 9) / 6
    assert rows[0]["gain"] == pytest.approx(0.88)   # 0.875 rounds half up


def test_retake_impact_skips_courses_already_at_target():
    assert retake_impact([c("A", 3, "4.00")], "latest", D("4.00")) == []


@pytest.mark.parametrize("cgpa,status", [(None, "no_data"), ("1.90", "probation"), ("2.10", "warning"),
                                         ("3.00", "safe"), ("3.60", "deans_list")])
def test_safe_zone_status(cgpa, status):
    assert safe_zone(None if cgpa is None else D(cgpa), D("2.00"), D("3.50"))["status"] == status


@pytest.mark.django_db
def test_credit_plan_flags_overload():
    a = make_client("alice")
    sid = add_semester(a, "Sem 1", 1, planned=True)
    for i in range(7):
        assert add_course(a, sid, f"C{i}", "3.0", "", status="planned").status_code == 201
    row = a.get("/api/credit-plan/").data["semesters"][0]
    assert row["credits"] == 21.0 and row["status"] == "over"


@pytest.mark.django_db
def test_retake_endpoint_and_validation():
    a = make_client("alice")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "C")
    add_course(a, sid, "MAT101", "3.0", "A+")
    data = a.get("/api/retake-impact/?grade_point=4").data
    assert [r["code"] for r in data["items"]] == ["CSE101"]
    assert a.get("/api/retake-impact/?grade_point=9").status_code == 400


@pytest.mark.django_db
def test_demo_account_is_labelled_and_has_data():
    r = APIClient().post("/api/auth/demo/")
    assert r.status_code == 201
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION="Token " + r.data["token"])
    assert client.get("/api/profile/").data["is_demo"] is True
    assert client.get("/api/dashboard/").data["cgpa"] is not None


@pytest.mark.django_db
def test_skills_are_private_and_validated():
    a, b = make_client("alice"), make_client("bob")
    assert a.post("/api/skills/", {"name": "Python", "level": 40, "target_level": 80}, format="json").status_code == 201
    assert b.get("/api/skills/").data == []
    assert a.post("/api/skills/", {"name": "python", "level": 10}, format="json").status_code == 400
    assert a.post("/api/skills/", {"name": "SQL", "level": 150}, format="json").status_code == 400


@pytest.mark.django_db
def test_pdf_report_downloads():
    a = make_client("alice")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "A")
    r = a.get("/api/report/pdf/")
    assert r.status_code == 200 and r["Content-Type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")
