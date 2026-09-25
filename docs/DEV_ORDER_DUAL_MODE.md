# Development order: canvas range and 3D platform

## Decision in PR #1

Keep the original 2D canvas Practice Range and the newer 3D Island Hunt and Training Booth as separate modes. The canvas range is available without login at `/practice` and stores its own progression in localStorage. The hunt and booth use a guest identity and the FastAPI/MongoDB service. Do not silently combine their progression, ballistics, scores, or weapon catalogs.

## Order of work

| Order | Work | Acceptance evidence |
| --- | --- | --- |
| 1 — Integration gate | Build the frontend from a clean install and run the backend against an isolated MongoDB database. Verify no import or package resolution errors. | `yarn build` succeeds; health, guest login, hunt scores, booth progress and leaderboards work against the local backend. |
| 2 — Route contract | Treat the URL as the screen selector. Verify `/`, `/menu`, `/practice`, `/hunt`, `/booth`, `/booth/play/:level/:caliber`, `/leaderboard`, `/lore`, and transient `/gameover`. Configure the deployed web host to serve the React entry point for these paths. | Direct load, refresh, Back and Forward show the corresponding mode; invalid booth parameters and missing session results return to a stable route. |
| 3 — Platform boundary | Keep `components/game` as the canvas mode and `game` as the 3D mode. Name UI entries distinctly. Document their separate controls and persistence. | Both modes can start, finish and exit in one browser session without transferring state or leaving timers, pointer lock, or audio behind. |
| 4 — Gameplay regression | Exercise target hits, misses, spawn limits, timer/pause/resume, ammo, score, XP and localStorage in the canvas range. Exercise 3D hunt combat and booth unlocks separately. | A repeatable manual run sheet or automated smoke test records outcomes for all three modes. Do not use inherited tests that point to a seeded external preview as proof of local behavior. |
| 5 — Performance baseline | Profile target counts and frame time on the canvas range, and draw calls/frame time on each 3D mode, in the same browser and device class. | Record frame-time percentiles, React commits, and target counts; capture a reproducible trace before changing the animation loop. |
| 6 — Targeted optimization | If the canvas trace confirms excessive commits, move live target motion into refs and draw on `requestAnimationFrame`, while publishing HUD snapshots at a lower rate. Cache static canvas layers or stable target details only if draw cost is measured. Optimize 3D rendering separately. | Compare before/after traces and rerun gameplay regression; avoid changing hit geometry or scoring as a side effect. |
| 7 — Shared product policy | Decide whether accounts, achievements, weapon definitions, and scoring should ever span modes. Define versioned conversion rules before moving old local progress to the backend. | Written decision and migration tests before any shared-state implementation. |

## Current integration limits

PR #1 connects the three modes and gives the URL control of navigation. The two source branches had no common ancestor. The imported backend tests expect an external seeded preview; a local MongoDB smoke environment and browser tests are still required before merge. The existing canvas renderer still uses React state at frame rate, so this order does not claim a performance improvement.
