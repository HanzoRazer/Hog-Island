from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Hog Island API")
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ------------------------- Models -------------------------
class GuestLoginRequest(BaseModel):
    name: str


class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    token: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class ScoreCreate(BaseModel):
    player_id: str
    name: str
    score: int
    kills: int = 0
    wave: int = 1
    survival_time: int = 0  # seconds


class Score(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    name: str
    score: int
    kills: int = 0
    wave: int = 1
    survival_time: int = 0
    created_at: str = Field(default_factory=now_iso)


class ScoreResult(BaseModel):
    score: Score
    rank: int
    is_personal_best: bool


class LeaderboardEntry(BaseModel):
    rank: int
    player_id: str
    name: str
    score: int
    kills: int
    wave: int
    survival_time: int
    created_at: str


BOOTH_LEVELS = 5
BOOTH_TARGETS = 20
BOOTH_PASS_HITS = {1: 10, 2: 11, 3: 12, 4: 13, 5: 14}


class BoothResultCreate(BaseModel):
    player_id: str
    name: str
    level: int
    caliber: str
    hits: int
    shots: int
    score: int
    best_streak: int = 0
    longest_hit_yd: int = 0


class BoothResult(BoothResultCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    passed: bool = False
    created_at: str = Field(default_factory=now_iso)


class BoothLevelBest(BaseModel):
    score: int
    hits: int
    shots: int
    caliber: str
    longest_hit_yd: int = 0


class BoothProgress(BaseModel):
    player_id: str
    unlocked_level: int = 1
    bests: dict[str, BoothLevelBest] = {}


class BoothSubmitResponse(BaseModel):
    result: BoothResult
    passed: bool
    unlocked_level: int
    newly_unlocked: bool
    is_level_best: bool
    rank: int


class BoothLeaderboardEntry(BaseModel):
    rank: int
    player_id: str
    name: str
    level: int
    score: int
    hits: int
    shots: int
    caliber: str
    longest_hit_yd: int
    created_at: str


# ------------------------- Routes -------------------------
@api_router.get("/")
async def root():
    return {"message": "Hog Island API online", "status": "ok"}


@api_router.post("/auth/guest", response_model=Player)
async def guest_login(req: GuestLoginRequest):
    name = req.name.strip()[:20]
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    player = Player(name=name)
    await db.players.insert_one(player.model_dump())
    return player


@api_router.post("/scores", response_model=ScoreResult)
async def submit_score(payload: ScoreCreate):
    score = Score(**payload.model_dump())
    await db.scores.insert_one(score.model_dump())

    # global rank = number of scores strictly greater + 1
    higher = await db.scores.count_documents({"score": {"$gt": score.score}})
    rank = higher + 1

    # personal best check
    best = await db.scores.find(
        {"player_id": score.player_id}, {"_id": 0, "score": 1}
    ).sort("score", -1).limit(1).to_list(1)
    is_pb = bool(best) and best[0]["score"] == score.score

    return ScoreResult(score=score, rank=rank, is_personal_best=is_pb)


@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def leaderboard(limit: int = 50):
    limit = max(1, min(limit, 100))
    # best score per player
    pipeline = [
        {"$sort": {"score": -1, "created_at": 1}},
        {"$group": {
            "_id": "$player_id",
            "name": {"$first": "$name"},
            "score": {"$first": "$score"},
            "kills": {"$first": "$kills"},
            "wave": {"$first": "$wave"},
            "survival_time": {"$first": "$survival_time"},
            "created_at": {"$first": "$created_at"},
        }},
        {"$sort": {"score": -1}},
        {"$limit": limit},
    ]
    rows = await db.scores.aggregate(pipeline).to_list(limit)
    entries = []
    for i, r in enumerate(rows):
        entries.append(LeaderboardEntry(
            rank=i + 1,
            player_id=r["_id"],
            name=r.get("name", "Unknown"),
            score=r.get("score", 0),
            kills=r.get("kills", 0),
            wave=r.get("wave", 1),
            survival_time=r.get("survival_time", 0),
            created_at=r.get("created_at", ""),
        ))
    return entries


# ------------------------- Training Booth -------------------------
async def get_or_create_progress(player_id: str) -> dict:
    doc = await db.booth_progress.find_one({"player_id": player_id}, {"_id": 0})
    if not doc:
        doc = BoothProgress(player_id=player_id).model_dump()
        await db.booth_progress.insert_one({**doc})
    return doc


@api_router.get("/booth/progress/{player_id}", response_model=BoothProgress)
async def booth_progress(player_id: str):
    return await get_or_create_progress(player_id)


@api_router.post("/booth/results", response_model=BoothSubmitResponse)
async def booth_submit(payload: BoothResultCreate):
    if not 1 <= payload.level <= BOOTH_LEVELS:
        raise HTTPException(status_code=400, detail="Invalid level")
    if payload.hits > payload.shots or payload.hits < 0 or payload.shots < 0:
        raise HTTPException(status_code=400, detail="Invalid hit/shot counts")
    progress = await get_or_create_progress(payload.player_id)
    if payload.level > progress["unlocked_level"]:
        raise HTTPException(status_code=403, detail="Level is locked")

    passed = payload.hits >= BOOTH_PASS_HITS[payload.level]
    result = BoothResult(**payload.model_dump(), passed=passed)
    await db.booth_results.insert_one(result.model_dump())

    unlocked = progress["unlocked_level"]
    newly_unlocked = False
    if passed and payload.level == unlocked and unlocked < BOOTH_LEVELS:
        unlocked += 1
        newly_unlocked = True

    key = str(payload.level)
    prev = progress.get("bests", {}).get(key)
    is_best = prev is None or payload.score > prev["score"]
    update = {"$set": {"unlocked_level": unlocked}}
    if is_best:
        update["$set"][f"bests.{key}"] = BoothLevelBest(
            score=payload.score, hits=payload.hits, shots=payload.shots,
            caliber=payload.caliber, longest_hit_yd=payload.longest_hit_yd,
        ).model_dump()
    await db.booth_progress.update_one({"player_id": payload.player_id}, update)

    higher = await db.booth_results.count_documents({"level": payload.level, "score": {"$gt": payload.score}})
    return BoothSubmitResponse(
        result=result, passed=passed, unlocked_level=unlocked,
        newly_unlocked=newly_unlocked, is_level_best=is_best, rank=higher + 1,
    )


@api_router.get("/booth/leaderboard", response_model=List[BoothLeaderboardEntry])
async def booth_leaderboard(level: int = 1, limit: int = 20):
    limit = max(1, min(limit, 100))
    pipeline = [
        {"$match": {"level": level}},
        {"$sort": {"score": -1, "created_at": 1}},
        {"$group": {
            "_id": "$player_id",
            "name": {"$first": "$name"},
            "score": {"$first": "$score"},
            "hits": {"$first": "$hits"},
            "shots": {"$first": "$shots"},
            "caliber": {"$first": "$caliber"},
            "longest_hit_yd": {"$first": "$longest_hit_yd"},
            "created_at": {"$first": "$created_at"},
        }},
        {"$sort": {"score": -1}},
        {"$limit": limit},
    ]
    rows = await db.booth_results.aggregate(pipeline).to_list(limit)
    return [
        BoothLeaderboardEntry(
            rank=i + 1, player_id=r["_id"], name=r.get("name", "Unknown"), level=level,
            score=r.get("score", 0), hits=r.get("hits", 0), shots=r.get("shots", 0),
            caliber=r.get("caliber", ""), longest_hit_yd=r.get("longest_hit_yd", 0),
            created_at=r.get("created_at", ""),
        )
        for i, r in enumerate(rows)
    ]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
