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
- NumberHelper FastAPI service lives in `numberhelper/src/number_helper_service.py`, exposes `/health` (typed response with uptime) and `/aggregate` backed by NumPy/pandas, tracks startup/shutdown via lifespan handlers, and is started via CLI args (`--host`, `--port`).

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