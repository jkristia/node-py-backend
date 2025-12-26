SHELL := /bin/bash
NODE_DIR := backend
NPM := npm --prefix $(NODE_DIR)
VENV := .venv
VENV_BIN := $(CURDIR)/$(VENV)/bin
PYTHON := $(VENV_BIN)/python
PIP := $(VENV_BIN)/pip

help: ## show available make targets
	@awk -F ':|##' '/^[^\t].+:.*##/ { printf "\033[36mmake %-28s\033[0m %s\n", $$1, $$NF }' $(MAKEFILE_LIST) | sort


PHONY: install install-node install-python run clean

install: .install-node .install-python ## install Node and Python dependencies

install-node: .install-node ## npm install inside backend/

install-python: .install-python ## install Python deps into existing virtualenv

run: .install-node .install-python ## run backend dev server with helper
	@if [ ! -x "$(PYTHON)" ]; then \
		echo "Error: $(VENV) not found. Create it first (python3 -m venv $(VENV))." >&2; \
		exit 1; \
	fi
	PYTHON_CMD=$(PYTHON) $(NPM) run dev

clean: ## remove installed dependencies (keeps virtualenv intact)
	rm -rf $(NODE_DIR)/node_modules
	@if [ -x "$(PYTHON)" ]; then \
		echo "Uninstalling Python packages from $(VENV)..."; \
		$(PIP) uninstall -y -r requirements.txt >/dev/null || true; \
	else \
		echo "Virtualenv $(VENV) not found; skipping Python cleanup."; \
	fi

.install-node:
	$(NPM) install

.install-python:
	@if [ ! -x "$(PYTHON)" ]; then \
		echo "Error: $(VENV) not found. Create it first (python3 -m venv $(VENV))." >&2; \
		exit 1; \
	fi
	$(PYTHON) -m pip install --upgrade pip
	$(PIP) install -r requirements.txt
