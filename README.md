# Hog Island

Browser game with three modes:

- **Canvas Practice Range** — original target drills and locally saved progress. Open `/practice` directly, or choose it from the island menu. This mode does not require guest login or the API.
- **3D Island Hunt** — survival game with guest identity, scores, and global leaderboard.
- **Training Booth** — five levels of moving targets and ballistic simulations, with progress stored by the API.

The React frontend is in `frontend/`; the FastAPI and MongoDB backend is in `backend/`. The canvas range lives in `frontend/src/components/game`, while the newer game and booth live in `frontend/src/game`. The modes have separate state and storage.

## Run locally

Set `MONGO_URL` and `DB_NAME` for the backend, then start `uvicorn server:app --reload` from `backend/`. Set `REACT_APP_BACKEND_URL` to the backend origin and run `yarn install` and `yarn start` in `frontend/`. The React development server handles direct `/practice` loads.

The integration branch copies the newer game from `conflict_240926_2248` onto the original `main` history; the two source branches have no common ancestor. It preserves the original canvas mode and its local progress key. The included backend tests under `backend/tests/` were written for a live Emergent preview with seeded data; set `REACT_APP_BACKEND_URL` to a suitable running test service before running them. They are not isolated unit tests.

## Windows integration run

On Windows 11 with Python, Node/Corepack, Docker Desktop and package registry access, run `powershell -NoProfile -File .\scripts\Invoke-DevOrder.ps1` from the repository root. The script creates an isolated MongoDB container, installs minimal backend runtime packages and frontend dependencies, exercises local API and route smoke checks, builds the frontend, and opens the range for the manual gameplay and performance gates. It writes a JSON report and logs under your temporary directory and stops its processes afterward. See [the development order](docs/DEV_ORDER_DUAL_MODE.md) for the remaining product decisions and optimization criteria.
