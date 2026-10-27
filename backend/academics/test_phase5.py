from datetime import timedelta

import pytest
from django.utils import timezone

from academics.test_api import make_client


def iso(delta):
    return (timezone.localdate() + timedelta(days=delta)).isoformat()


def create(client, url, payload):
    r = client.post(url, payload, format="json")
    assert r.status_code == 201, r.data
    return r.data


@pytest.mark.django_db
def test_deadlines_window_overdue_and_status_filter():
    a = make_client("alice")
    create(a, "/api/applications/", {"company": "Acme", "role": "Intern", "status": "wishlist", "deadline": iso(3)})
    create(a, "/api/applications/", {"company": "Done Co", "role": "Intern", "status": "applied", "deadline": iso(2)})
    create(a, "/api/scholarships/", {"name": "Far Away Award", "status": "preparing", "deadline": iso(30)})
    create(a, "/api/documents/", {"name": "Transcript", "status": "todo", "due_date": iso(-1)})
    create(a, "/api/documents/", {"name": "Passport copy", "status": "submitted", "due_date": iso(1)})
    create(a, "/api/recommendations/", {"recommender": "Dr X", "status": "asked", "due_date": iso(5)})

    items = a.get("/api/deadlines/?days=14").data
    assert [i["title"] for i in items] == ["Transcript", "Acme: Intern", "Letter from Dr X"]
    assert items[0]["days_left"] == -1 and items[0]["overdue"] is True
    assert items[1]["days_left"] == 3 and items[1]["overdue"] is False

    wide = a.get("/api/deadlines/?days=60").data
    assert "Far Away Award" in [i["title"] for i in wide]

    assert a.get("/api/deadlines/?days=0").status_code == 400
    assert a.get("/api/deadlines/?days=abc").status_code == 400
    assert a.get("/api/deadlines/?days=91").status_code == 400


@pytest.mark.django_db
def test_deadlines_and_recommendations_are_private():
    a, b = make_client("alice"), make_client("bob")
    rec = create(a, "/api/recommendations/", {"recommender": "Dr X", "status": "asked", "due_date": iso(2)})
    assert b.get("/api/deadlines/").data == []
    assert b.get("/api/recommendations/").data == []
    assert b.patch(f"/api/recommendations/{rec['id']}/", {"status": "submitted"}, format="json").status_code == 404


@pytest.mark.django_db
def test_recommendation_due_date_cannot_precede_asked_date():
    a = make_client("alice")
    bad = {"recommender": "Dr Y", "asked_date": iso(5), "due_date": iso(1), "status": "asked"}
    assert a.post("/api/recommendations/", bad, format="json").status_code == 400
    assert a.post("/api/recommendations/", {"recommender": "Dr Y", "status": "bogus"}, format="json").status_code == 400
