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
- [x] 2026-06 Phase 4 slice (iteration_2.json pass + self-test):
  - Island Soundscape: procedural Web Audio engine `game/audio.js` (ambient drone+wind, per-weapon gunshots, reload, dry-fire, swap, hit/kill/hurt, pickup, wave gong, spatialised creature roars w/ stereo pan). `M` mute, volume slider + mute button in pause overlay, prefs in localStorage `hog_island_audio`. Any key in `SOUND_FILES` present on disk overrides the synth.
  - Mystical Surge ("reality distorts"): from wave 2, 10s into each wave for 9s — violet fog, breathing FOV, spectral orbs, muffled/echo audio, beasts shapeshift type (50%), +25% speed, 2× bounty, HUD banner/overlay.
  - Weapon Arsenal `game/weapons.js`: Warden Carbine (12/∞), Mire Breaker shotgun (6/18, 8 pellets spread), Fogpiercer marksman (5/10, 125 dmg). Keys 1/2/3, Q + wheel cycle, clickable HUD slots; per-weapon mag+reserve, fire delay, reload cancel on swap.
  - Pickups `game/Pickups.jsx`: 8 spawn points, health +35 / ammo cache (+6 shells, +5 rounds), 25s respawn, floating fallback meshes + ground ring.
  - Asset drop-in: `public/assets/` + `game/assets.config.js` manifest (map, 6 creatures, 2 pickups, 3 weapon viewmodels, sounds). `ModelSlot.jsx` HEAD-probes files (rejects SPA index.html), loads .glb via useGLTF with Suspense + error boundary, falls back to placeholders. README in `public/assets/`.
  - Fixed: drei PointerLockControls default `selector` (document) locked on any click → now `selector="#pointer-lock-disabled"`, lock only via Enter-the-Hunt button.
  - Refactor: GameScreen split into Creature.jsx, Island.jsx, Pickups.jsx, Mystical.jsx, ModelSlot.jsx, constants.js.
- [x] 2026-06 Training Booth + caliber ballistics (iteration_3.json: backend 17/17, frontend pass; 2 UX issues fixed & self-verified):
  - Menu card "Training Booth" → `screens/Booth.jsx` (5 level cards w/ lock state + bests, caliber picker grouped by category, per-level ledger, start).
  - `data/calibers.js`: 18 loadouts (.22LR, .22 Mag, .223, 7.62×39 AK, .30 Carbine, .30-06 bolt, M1 Garand, .300 WM, .50 Beowulf AR pistol, .30-30, .45-70, .357 carbine, 12ga 00 buck, .357 & .45 Colt revolvers, 9mm, 10mm, .45 ACP). `model: "TBD"` placeholders for makes/models.
  - `game/booth/ballistics.js`: v0 + drag (k=0.000346/BC) + gravity integration, zero-angle bisection solver, hold solution (drop mil, wind mil via lag-time, TOF, lead), oriented-box hog hit test. Verified: .30-06 100-yd zero → ~10 mil at 1000 yd; dead-on aim hits at 100/300/600.
  - `game/booth/BoothScreen.jsx`: stationary FPS range (1000 yd lane, range posts/berms), one running hog at a time (level-scaled range 25–1000 yd, speed 2–30 mph, crossing angle up to 90°, wind 0–15 mph from L3), real projectile sim w/ sub-step collision, tracers + dust puffs, miss feedback (HIGH/LOW/LEFT/RIGHT inches/yards or SHORT), recoil, scope (hold RMB → per-caliber magnification, mil-dot reticle, reduced sensitivity), zero dial (↑/↓, [ ], scroll, overlay buttons), actions (semi/auto-hold/bolt/lever/pump cycle times), reload.
  - Levels 1–5 (`levels.js`), 20 targets each, pass hits 10/11/12/13/14 → unlock next; score = 100×(1+yd/200)×(1+mph/30)×streak bonus.
  - Backend: `GET /api/booth/progress/{player_id}`, `POST /api/booth/results` (403 on locked level, updates unlock + per-level best, returns rank), `GET /api/booth/leaderboard?level=`. Collections `booth_progress`, `booth_results`.
  - Fixed: R3F default camera lookAt(0,0,0) from (0,1.6,0) pointed at floor → explicit rotation + view reset on start; zero chevrons moved into pause overlay; explicit Escape → exitPointerLock.

## Backlog
- P0: User will upload "hog island" map template + weapon templates → convert to .glb if needed, place in `public/assets/`, tune `assets.config.js` scale/offsets (and `ARENA_RADIUS` in constants.js to match map).
- P0 (from user's design doc, 2026-06): fill in weapon makes/models in `data/calibers.js` when user supplies them; fold caliber arsenal + unlocks into the main Hog Island hunt.
- P1: Top-down shooter mode; side-scroller mode; visual style switcher (realistic / cartoon / pixel-retro); level/map select.
- P1: minimap/threat radar; melee/dodge; weapon-specific viewmodel animation once .glb viewmodels arrive.
- P2: Booth extras — moving-target lead trainer overlay, hit-zone scoring (vitals), per-caliber leaderboards, wind gusts.
- P3 (deferred): WebSocket 2-player server-authoritative deathmatch, client prediction + interpolation.
- Tech-debt (non-blocking): leaderboard tie-break by wave/survival_time; validate guest token on /scores and /booth/results.

## Next Tasks
- Receive user's map/weapon templates (attach in chat) and wire them into asset slots.
- Phase 3 multiplayer when user asks.
