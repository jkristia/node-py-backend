# Project Notes: TsPyBackend
NodeJs (TypeScript) backend with python helper service for number crunching

## Project Overview
This project consists of:
- **Purpose**: Create a node service which exposes RestAPi to clients. Launches and internal python service `NumberHelper` at startup. Passes any number crunching tasks to this help service.
- **Backend:** NodeJS (Typescript) with express API
- **NumberHelper:** Python async service with Rest API (and later zeroMQ)

## Design Decisions
- **Backend:**
	- use epxress for api
	- encapsulate express app in Main entrypoint class
	- structure:
		- `backend/src/main.ts`
	- cleanly handle SIGTERM
- **NumberHelper**
	- use FastApi, run async
	- encapsulate api in NumberHelperService entry point class
	- structure:
		- `numberhelper/src/number_helper_servive.py`
	- cleanly handle SIGTERM

## Current Feattures
List of what has been implemented to far:
- TODO

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