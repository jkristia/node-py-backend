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
	- encapsulate FastApi in class NumberHelperService. This is the main entry point for the helper service
	- structure:
		- `numberhelper/src/number_helper_service.py`
	- cleanly handle SIGTERM

## Current Feattures
List of what has been implemented so far:
- **NumberHelper FastAPI service**
	- Lives in `numberhelper/src/number_helper_service.py`
	- Exposes `/health` (typed response with uptime) and `/aggregate` backed by NumPy/pandas
	- Uses lifespan hooks for startup/shutdown logging and accepts CLI args (`--host`, `--port`)
	- Shuts down cleanly whether launched standalone or from the Node backend
- **Backend Express service (TypeScript)**
	- Encapsulated in `Main`, launches the helper process and waits for readiness
	- Proxies `/numbers/*` routes via `NumberHelperClient` and exposes `/health` including helper status
	- Forwards SIGINT/SIGTERM (translating Ctrl+C to SIGTERM for the helper) so both processes exit gracefully
	- Shared configuration, routes, and clients live under `backend/src/` with strict TypeScript interfaces

## Next Steps
List of TODO items
- Launch `NumberHelperService` from backend at startup.

## Coding Guidelines
- **TypeScript:**
	- Strict mode enabled
	- use express for API
	- follow typescript naming conversion for files, classes and variables
- **Python:**
	- use async FastAPI for service
	- follow python naming convention for files, classes and variables
	- all variables, parameters and return values must by typed