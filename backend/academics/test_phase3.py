import pytest

from academics.test_api import add_course, add_semester, make_client

CASES = [
    ("/api/projects/", {"name": "PathCompass", "github_url": "https://github.com/x/y", "status": "building"}),
    ("/api/applications/", {"company": "Acme", "role": "Intern", "status": "applied", "applied_date": "2026-10-01"}),
    ("/api/scholarships/", {"name": "Merit Award", "status": "researching", "deadline": "2026-12-01"}),
]

GOOD = ("semester,order,code,title,credits,letter_grade,status\n"
        "Sem 1,1,CSE101,Intro,3,A+,completed\n"
        "Sem 1,1,MAT101,Calc,3,B,completed\n"
        "Sem 2,2,CSE102,DS,3,,planned\n")


@pytest.mark.django_db
@pytest.mark.parametrize("url,payload", CASES)
def test_trackers_are_private_and_validated(url, payload):
    a, b = make_client("alice"), make_client("bob")
    r = a.post(url, payload, format="json")
    assert r.status_code == 201, r.data
    assert b.get(url).data == []
    assert b.patch(f"{url}{r.data['id']}/", {"status": "offer"}, format="json").status_code == 404
    assert a.post(url, {**payload, "status": "bogus"}, format="json").status_code == 400


@pytest.mark.django_db
def test_unsafe_link_is_rejected():
    a = make_client("alice")
    r = a.post("/api/projects/", {"name": "X", "github_url": "javascript:alert(1)", "status": "idea"}, format="json")
    assert r.status_code == 400


@pytest.mark.django_db
def test_what_if_fail_a_course():
    a = make_client("alice")
    sid = add_semester(a)
    add_course(a, sid, "CSE101", "3.0", "A+")           # 12 points over 3 credits
    d = a.get("/api/what-if/?credits=3&grade_point=0").data
    assert d["current_cgpa"] == 4.0 and d["after_cgpa"] == 2.0 and d["change"] == -2.0   # 12 / 6
    assert a.get("/api/what-if/?credits=0&grade_point=0").status_code == 400
    assert a.get("/api/what-if/?credits=3&grade_point=9").status_code == 400


@pytest.mark.django_db
def test_csv_import_creates_semesters_and_courses():
    a = make_client("alice")
    r = a.post("/api/import/courses/", {"csv": GOOD}, format="json")
    assert r.status_code == 201 and r.data["imported"] == 3
    assert a.get("/api/dashboard/").data["cgpa"] == 3.5          # 21 / 6, planned semester ignored
    assert len(a.get("/api/semesters/").data) == 2
    assert a.post("/api/import/courses/", {"csv": GOOD}, format="json").status_code == 400   # already exists


@pytest.mark.django_db
def test_csv_import_is_all_or_nothing():
    a = make_client("alice")
    bad = GOOD + "Sem 3,3,CSE103,X,3,Z,completed\n"
    r = a.post("/api/import/courses/", {"csv": bad}, format="json")
    assert r.status_code == 400 and r.data["errors"][0].startswith("Line 5")
    assert a.get("/api/semesters/").data == []


@pytest.mark.django_db
def test_csv_template_downloads():
    r = make_client("alice").get("/api/import/template/")
    assert r.status_code == 200 and b"semester,order,code" in r.content
