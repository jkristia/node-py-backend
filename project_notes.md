# Project Notes: TsPyBackend
NodeJs (TypeScript) backend with python helper service for number crunching

## Project Overview
This project consists of:
- **Purpose**: Create a node service which exposes RestAPi to clients. Launches and internal python service `NumberHelper` at startup. Passes any number crunching tasks to this help service.
- **Backend:** NodeJS (Typescript) with express API
- **NumberHelper:** Python async service with Rest API (and later zeroMQ)

## Design Decisions
- node version: 20+
- python version: 3.12
- **Backend:**
	- use epxress for server api, Axios for api requests send to numberhelper
	- encapsulate express app in typescript class Main. This is the entry point for the backend app
	- structure:
		- `backend/src/main.ts`
	- cleanly handle SIGTERM
- **NumberHelper**
	- use FastApi, run async
	- encapsulate FastApi in class NumberHelperService and keep the CLI bootstrap separate in `main.py`
	- structure:
		- `numberhelper/src/number_helper_service.py`
		- `numberhelper/src/main.py`
	- cleanly handle SIGTERM

## Current Feattures
List of what has been implemented so far:
- **NumberHelper FastAPI service**
	- Lives in `numberhelper/src/number_helper_service.py`
	- Exposes `/health` (typed response with uptime) and `/aggregate` backed by NumPy/pandas
	- Uses lifespan hooks for startup/shutdown logging; CLI parsing (`--host`, `--port`) now lives in `numberhelper/src/main.py`
	- Shuts down cleanly whether launched standalone or from the Node backend
- **Backend Express service (TypeScript)**
	- Encapsulated in `Main`, launches the helper process and waits for readiness
	- Proxies `/numbers/*` routes via `NumberHelperClient` and exposes `/health` including helper status
	- Forwards SIGINT/SIGTERM (translating Ctrl+C to SIGTERM for the helper) so both processes exit gracefully
	- Shared configuration, routes, and clients live under `backend/src/` with strict TypeScript interfaces
- **Developer Tooling**
	- Repo-level `Makefile` adds `make install`, `make run`, `make clean`, and `make help`
	- `make run` boots the TypeScript backend while pointing `PYTHON_CMD` at the existing `.venv`
	- `make install` delegates to hidden `.install-node`/`.install-python` targets that enforce a pre-created `.venv`
	- `make clean` removes `backend/node_modules` and uninstalls the helper’s Python dependencies without deleting the virtualenv

## API
- **Backend Host**: `<host>` represents the Express server root (defaults to `http://127.0.0.1:3000`).
- **Helper Host**: `<helper-host>` represents the FastAPI helper (defaults to `http://127.0.0.1:8000`).

| Method | Path | Host | Description |
| --- | --- | --- | --- |
| GET | `/health` | `<host>` | Backend health summary including helper status. |
| GET | `/numbers/health` | `<host>` | Proxies helper uptime/status for quick readiness checks. |
| POST | `/numbers/aggregate` | `<host>` | Accepts `{ "numbers": number[] }` and returns aggregate stats from the helper. |
| GET | `/health` | `<helper-host>` | Helper uptime/status payload consumed by the backend. |
| POST | `/aggregate` | `<helper-host>` | Raw helper aggregation endpoint; same payload/response as the proxied route. |

## Next Steps
List of TODO items
- Add automated tests (unit + integration) for both backend and helper services.
- Provide API docs / examples (e.g., expand api.rest) and wire into CI for lint/build.

## Coding Guidelines
- **TypeScript:**
	- Strict mode enabled
	- use express for API
	- follow typescript naming conversion for files, classes and variables
	- all variables, parameters and return values must by typed
- **Python:**
	- use async FastAPI for service
	- follow python naming convention for files, classes and variables
	- all variables, parameters and return values must by typed