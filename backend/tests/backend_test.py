"""Hog Island backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://island-shooter-8.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root health ----------
def test_root_status_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# ---------- Guest auth ----------
def test_guest_login_success(client):
    r = client.post(f"{API}/auth/guest", json={"name": "TEST_Hunter"})
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "TEST_Hunter"
    assert isinstance(d["id"], str) and len(d["id"]) > 0
    assert isinstance(d["token"], str) and len(d["token"]) > 0


def test_guest_login_empty_name_400(client):
    r = client.post(f"{API}/auth/guest", json={"name": "   "})
    assert r.status_code == 400


def test_guest_login_missing_field_422(client):
    r = client.post(f"{API}/auth/guest", json={})
    assert r.status_code == 422


# ---------- Scores + Leaderboard ----------
@pytest.fixture(scope="module")
def player(client):
    r = client.post(f"{API}/auth/guest", json={"name": "TEST_ScorePlayer"})
    assert r.status_code == 200
    return r.json()


def test_submit_score_returns_rank_and_pb(client, player):
    payload = {
        "player_id": player["id"],
        "name": player["name"],
        "score": 500,
        "kills": 5,
        "wave": 2,
        "survival_time": 60,
    }
    r = client.post(f"{API}/scores", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert "score" in d and "rank" in d and "is_personal_best" in d
    assert d["score"]["score"] == 500
    assert d["score"]["player_id"] == player["id"]
    assert d["is_personal_best"] is True
    assert d["rank"] >= 1


def test_submit_higher_score_updates_pb(client, player):
    payload = {
        "player_id": player["id"],
        "name": player["name"],
        "score": 2500,
        "kills": 12,
        "wave": 4,
        "survival_time": 180,
    }
    r = client.post(f"{API}/scores", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["is_personal_best"] is True


def test_leaderboard_sorted_desc_and_limit(client):
    r = client.get(f"{API}/leaderboard", params={"limit": 10})
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list)
    assert len(rows) <= 10
    # Rank should be 1..N and scores non-increasing
    for i, row in enumerate(rows):
        assert row["rank"] == i + 1
        assert {"player_id", "name", "score", "kills", "wave", "survival_time"} <= set(row.keys())
    scores = [r_["score"] for r_ in rows]
    assert scores == sorted(scores, reverse=True)


def test_leaderboard_best_per_player(client, player):
    r = client.get(f"{API}/leaderboard", params={"limit": 100})
    rows = r.json()
    mine = [x for x in rows if x["player_id"] == player["id"]]
    assert len(mine) == 1, "Leaderboard must have exactly one entry per player (best score)"
    assert mine[0]["score"] == 2500


def test_seeded_testhunter_present(client):
    r = client.get(f"{API}/leaderboard", params={"limit": 100})
    rows = r.json()
    names = [x["name"] for x in rows]
    # per problem statement, TestHunter with 1500 should already exist
    assert "TestHunter" in names
