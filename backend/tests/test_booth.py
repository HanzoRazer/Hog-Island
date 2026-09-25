"""Training Booth endpoint tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://island-shooter-8.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def new_player_id():
    return f"TEST_booth_{uuid.uuid4()}"


# ---------- Progress creation ----------
def test_progress_creates_default_for_new_player(client, new_player_id):
    r = client.get(f"{API}/booth/progress/{new_player_id}")
    assert r.status_code == 200
    d = r.json()
    assert d["player_id"] == new_player_id
    assert d["unlocked_level"] == 1
    assert d["bests"] == {}


# ---------- Passing level 1 unlocks 2 ----------
def test_submit_level1_pass_unlocks_level2(client, new_player_id):
    payload = {
        "player_id": new_player_id,
        "name": "TEST_Booth",
        "level": 1,
        "caliber": "r223",
        "hits": 15,
        "shots": 20,
        "score": 1500,
        "best_streak": 5,
        "longest_hit_yd": 250,
    }
    r = client.post(f"{API}/booth/results", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["passed"] is True
    assert d["unlocked_level"] == 2
    assert d["newly_unlocked"] is True
    assert d["is_level_best"] is True
    assert d["rank"] >= 1
    assert d["result"]["passed"] is True


# ---------- Lower score for same level does not overwrite best ----------
def test_submit_lower_score_not_best_and_unlock_stays(client, new_player_id):
    payload = {
        "player_id": new_player_id,
        "name": "TEST_Booth",
        "level": 1,
        "caliber": "r223",
        "hits": 11,
        "shots": 20,
        "score": 500,
        "best_streak": 2,
        "longest_hit_yd": 100,
    }
    r = client.post(f"{API}/booth/results", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["is_level_best"] is False
    assert d["unlocked_level"] == 2

    # verify persistence
    p = client.get(f"{API}/booth/progress/{new_player_id}").json()
    assert p["unlocked_level"] == 2
    assert p["bests"]["1"]["score"] == 1500


# ---------- Submitting locked level -> 403 ----------
def test_submit_locked_level_forbidden(client, new_player_id):
    payload = {
        "player_id": new_player_id,
        "name": "TEST_Booth",
        "level": 3,
        "caliber": "r3006",
        "hits": 14,
        "shots": 20,
        "score": 1000,
        "longest_hit_yd": 400,
    }
    r = client.post(f"{API}/booth/results", json=payload)
    assert r.status_code == 403
    assert "locked" in r.json().get("detail", "").lower()


# ---------- Validation ----------
def test_submit_invalid_level_400(client, new_player_id):
    payload = {
        "player_id": new_player_id, "name": "TEST_Booth", "level": 6,
        "caliber": "r223", "hits": 1, "shots": 1, "score": 10,
    }
    r = client.post(f"{API}/booth/results", json=payload)
    assert r.status_code == 400


def test_submit_hits_gt_shots_400(client, new_player_id):
    payload = {
        "player_id": new_player_id, "name": "TEST_Booth", "level": 1,
        "caliber": "r223", "hits": 30, "shots": 20, "score": 10,
    }
    r = client.post(f"{API}/booth/results", json=payload)
    assert r.status_code == 400


# ---------- Leaderboard ----------
def test_leaderboard_level1_sorted_desc_with_expected_fields(client):
    r = client.get(f"{API}/booth/leaderboard", params={"level": 1, "limit": 50})
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list)
    assert len(rows) >= 1
    for i, row in enumerate(rows):
        assert row["rank"] == i + 1
        for k in ["player_id", "name", "hits", "shots", "caliber", "longest_hit_yd", "score", "level"]:
            assert k in row
        assert row["level"] == 1
    scores = [r_["score"] for r_ in rows]
    assert scores == sorted(scores, reverse=True)


def test_leaderboard_best_per_player(client, new_player_id):
    r = client.get(f"{API}/booth/leaderboard", params={"level": 1, "limit": 100})
    rows = r.json()
    mine = [x for x in rows if x["player_id"] == new_player_id]
    assert len(mine) == 1
    assert mine[0]["score"] == 1500
