import pytest

from academics.test_api import make_client


@pytest.mark.django_db
@pytest.mark.parametrize("exam,good,bad", [("ielts", 6.5, 6.3), ("ielts", 9, 9.5), ("gre", 330, 400),
                                           ("gre", 300, 255), ("toefl", 100, 121)])
def test_score_ranges_are_enforced(exam, good, bad):
    a = make_client("alice")
    ok = a.post("/api/test-scores/", {"exam": exam, "kind": "mock", "score": good}, format="json")
    assert ok.status_code == 201, ok.data
    assert a.post("/api/test-scores/", {"exam": exam, "kind": "mock", "score": bad}, format="json").status_code == 400


@pytest.mark.django_db
def test_scores_are_private():
    a, b = make_client("alice"), make_client("bob")
    r = a.post("/api/test-scores/", {"exam": "ielts", "kind": "official", "score": 7}, format="json")
    assert b.get("/api/test-scores/").data == []
    assert b.delete(f"/api/test-scores/{r.data['id']}/").status_code == 404


@pytest.mark.django_db
def test_document_starter_list_is_added_once():
    a, b = make_client("alice"), make_client("bob")
    first = a.post("/api/documents/seed/")
    assert first.status_code == 201 and first.data["added"] == 9
    assert a.post("/api/documents/seed/").data["added"] == 0
    assert len(a.get("/api/documents/").data) == 9
    assert b.get("/api/documents/").data == []
    doc = a.get("/api/documents/").data[0]
    assert a.patch(f"/api/documents/{doc['id']}/", {"status": "ready"}, format="json").status_code == 200
    assert a.patch(f"/api/documents/{doc['id']}/", {"status": "nope"}, format="json").status_code == 400


@pytest.mark.django_db
def test_requirements_validation_and_privacy():
    a, b = make_client("alice"), make_client("bob")
    assert a.post("/api/requirements/", {"name": "Core", "required_credits": "60"}, format="json").status_code == 201
    assert a.post("/api/requirements/", {"name": "core", "required_credits": "10"}, format="json").status_code == 400
    assert a.post("/api/requirements/", {"name": "Lab", "required_credits": "6", "done_credits": "-3"},
                  format="json").status_code == 400
    assert b.get("/api/requirements/").data == []
