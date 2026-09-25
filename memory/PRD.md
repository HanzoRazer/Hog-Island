# Hog Island — Product Requirements Document

## Original Problem Statement
A first-person 3D browser survival shooter set on a mystical fog-shrouded island of shape-shifting
beasts (hogs, buffalos, bears, panthers, wild dogs, dinosaurs). Built on React + FastAPI + MongoDB,
extended with React Three Fiber (Three.js) and pointer-lock controls. Phased delivery; ship a
playable, shippable game (Phases 0–2) before real-time multiplayer.

## User Choices (locked)
- Scope now: **Phase 0–2** (solo 3D FPS + accounts + global leaderboard).
- Login: **Guest-only** (pick a name, no password).
- Multiplayer target later: **2 players** (Phase 3, deferred).
- Art: placeholder low-poly now (user provides real assets later).
- Theme: mystical island; shape-shifting beasts; extensive lore.

## Architecture
- **Frontend:** React 19 + React Three Fiber v9 + drei + three@0.169. Screen state machine in `App.js`.
  - `screens/Menu.jsx` (Landing + MainMenu), `screens/Leaderboard.jsx`, `screens/LoreCodex.jsx`, `screens/GameOver.jsx`
  - `game/GameScreen.jsx` (R3F scene, player controller, hitscan shooter, creature AI, spawner, waves), `game/HUD.jsx`
  - `data/creatures.js` (6 beasts w/ combat + lore stats), `data/lore.js` (prologue + timeline)
  - `lib/api.js` — axios to `REACT_APP_BACKEND_URL`
- **Backend:** FastAPI, all routes under `/api`:
  - `GET /api/` health, `POST /api/auth/guest`, `POST /api/scores`, `GET /api/leaderboard`
- **DB:** MongoDB `players`, `scores` (uuid ids, ISO datetimes, no raw ObjectId returned).

## User Personas
- The creator continuing the project.
- Casual players wanting a quick browser FPS, no install.
- Small friend groups (future multiplayer).

## Core Requirements (static)
- 3D FPS loop: WASD move, mouse-look (pointer lock), click to fire (hitscan), hit detection, ammo/reload.
- AI creatures that chase and damage the player; player health + damage feedback; endless escalating waves.
- Guest identity persists; global leaderboard persists in MongoDB.
- Lore codex / bestiary.

## Implemented (2026-06)
- [x] Phase 0: R3F stack added, 3D scene renders in-browser (island, fog, sky, rocks/trees, mire pools, standing-stone arena ring).
- [x] Phase 1: pointer-lock FPS controls, WASD movement w/ arena clamp, hitscan shooting w/ crosshair/muzzle/hitmarker, ammo+reload, 6 creature types with per-type HP/speed/damage/bounty, chasing AI + proximity attacks, player health + damage vignette, wave escalation + spawner, game-over.
- [x] Phase 2: guest login API + UI, score submission w/ global rank + personal-best, global leaderboard (best-per-player) with podium + table, game-over auto-submit.
- [x] Lore: animated prologue on landing, bestiary grid + creature detail modal, island chronicle timeline.
- [x] E2E tested: backend 9/9 pytest pass, frontend happy-path pass (iteration_1.json).

## Backlog
- P1: Sound (ambient fog, gunfire, creature roars); minimap/threat radar.
- P1: Weapon variety; melee/dodge; pickups (health/ammo).
- P2: More maps; matchmaking/lobby UI.
- P3 (deferred): WebSocket 2-player server-authoritative deathmatch, client prediction + interpolation.
- Tech-debt (non-blocking): split GameScreen.jsx into files; leaderboard tie-break by wave/survival_time; validate guest token on /scores.

## Next Tasks
- Gather user's real 3D assets/maps when provided; swap placeholder geometry.
- Add audio + more game-feel polish (Phase 4 slice) if requested.
