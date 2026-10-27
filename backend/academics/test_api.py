import pytest
from rest_framework.test import APIClient

PASSWORD = "S3cure-pass-123"


def make_client(username):
    client = APIClient()
    r = client.post("/api/auth/register/", {"username": username, "email": f"{username}@example.com",
                                            "password": PASSWORD}, format="json")
    assert r.status_code == 201, r.data
    client.credentials(HTTP_AUTHORIZATION="Token " + r.data["token"])
    return client


def add_semester(client, name="Sem 1", order=1, planned=False):
    r = client.post("/api/semesters/", {"name": name, "order": order, "is_planned": planned}, format="json")
    assert r.status_code == 201, r.data
    return r.data["id"]


def add_course(client, sid, code, credits, letter, status="completed"):
    return client.post("/api/courses/", {"semester": sid, "code": code, "title": code, "credits": credits,
                                         "letter_grade": letter, "status": status}, format="json")


@pytest.mark.django_db
def test_login_required():
    assert APIClient().get("/api/dashboard/").status_code == 401


@pytest.mark.django_db
def test_weak_password_rejected():
    r = APIClient().post("/api/auth/register/", {"username": "x", "email": "x@example.com",
                                                 "password": "123"}, format="json")
    assert r.status_code == 400


@pytest.mark.django_db
def test_dashboard_cgpa_matches_hand_calculation():
    a = make_client("alice")
    sid = add_semester(a)
    assert add_course(a, sid, "cse101", "3.0", "a+").status_code == 201   # 3 x 4.00 = 12
    assert add_course(a, sid, "mat101", "3.0", "B").status_code == 201    # 3 x 3.00 = 9
    d = a.get("/api/dashboard/").data
    assert d["cgpa"] == 3.5                       # 21 / 6
    assert d["credits_earned"] == 6.0
    assert d["credits_remaining"] == 134.0        # default 140 - 6


@pytest.mark.django_db
def test_planned_semester_is_not_counted():
    a = make_client("alice")
    s1 = add_semester(a)
    add_course(a, s1, "CSE101", "3.0", "B")
    s2 = add_semester(a, "Sem 2", 2, planned=True)
    add_course(a, s2, "CSE102", "3.0", "A+", status="planned")
    assert a.get("/api/dashboard/").data["cgpa"] == 3.0


@pytest.mark.django_db
def test_invalid_letter_and_duplicate_rejected():
    a = make_client("alice")
    sid = add_semester(a)
    assert add_course(a, sid, "CSE101", "3.0", "Z").status_code == 400
    assert add_course(a, sid, "CSE101", "3.0", "A").status_code == 201
    assert add_course(a, sid, "cse101", "3.0", "B").status_code == 400    # duplicate in the same semester


@pytest.mark.django_db
def test_users_cannot_see_or_touch_each_others_data():
    a, b = make_client("alice"), make_client("bob")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "A")
    assert b.get("/api/semesters/").data == []
    assert b.get("/api/courses/").data == []
    assert b.get(f"/api/semesters/{sid}/").status_code == 404
    assert add_course(b, sid, "HACK1", "3.0", "A+").status_code == 400    # cannot add into Alice's semester
    assert b.get("/api/dashboard/").data["cgpa"] is None


@pytest.mark.django_db
def test_target_endpoint():
    a = make_client("alice")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "A+")
    add_course(a, sid, "MAT101", "3.0", "B")
    a.patch("/api/profile/", {"total_credits_required": "12"}, format="json")
    ok = a.get("/api/target/?target=3.75").data
    assert ok["required_avg_gpa"] == 4.0 and ok["achievable"]             # (45 - 21) / 6
    bad = a.get("/api/target/?target=3.9").data
    assert not bad["achievable"] and "Not mathematically achievable" in bad["message"]
    assert a.get("/api/target/?target=5").status_code == 400


@pytest.mark.django_db
def test_changing_scale_updates_saved_courses():
    a = make_client("alice")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "A")                              # 3.75 by default
    scale = a.get("/api/scale/").data
    for row in scale["boundaries"]:
        if row["letter"] == "A":
            row["point"] = "4.00"
    assert a.put("/api/scale/", {"boundaries": scale["boundaries"]}, format="json").status_code == 200
    assert a.get("/api/dashboard/").data["cgpa"] == 4.0
