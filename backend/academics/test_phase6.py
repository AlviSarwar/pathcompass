import pytest
from rest_framework.test import APIClient

from academics.test_api import PASSWORD, make_client


@pytest.mark.django_db
def test_login_is_rate_limited():
    c = APIClient()
    codes = [c.post("/api/auth/login/", {"username": "nobody", "password": "x"}, format="json").status_code
             for _ in range(22)]
    assert codes[0] == 400 and 429 in codes


@pytest.mark.django_db
def test_demo_creation_is_rate_limited():
    c = APIClient()
    codes = [c.post("/api/auth/demo/").status_code for _ in range(12)]
    assert codes[0] == 201 and 429 in codes


@pytest.mark.django_db
def test_login_works_even_with_a_stale_token_header():
    make_client("alice")
    c = APIClient()
    c.credentials(HTTP_AUTHORIZATION="Token not-a-real-token")
    r = c.post("/api/auth/login/", {"username": "alice", "password": PASSWORD}, format="json")
    assert r.status_code == 200 and "token" in r.data
