"""FastAPI service for performing number aggregations."""

from __future__ import annotations

import argparse
import logging
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass
from statistics import median
from typing import AsyncIterator, Sequence

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
import uvicorn
from api_models import AggregateRequest, AggregateResponse, HealthResponse


class NumberHelperService:
    """Encapsulates the FastAPI app and numerical helpers."""

    def __init__(self) -> None:
        self._app = FastAPI(title="Number Helper Service", version="0.1.0", lifespan=self._lifespan)
        self._started_at = 0.0
        self._register_handlers()

    @property
    def app(self) -> FastAPI:
        return self._app

    @asynccontextmanager
    async def _lifespan(self, _app: FastAPI) -> AsyncIterator[None]:
        logging.info("NumberHelperService starting up")
        self._started_at = time.time()
        try:
            yield
        finally:
            logging.info("NumberHelperService shutting down")

    def _register_handlers(self) -> None:
        app = self._app
        app.add_api_route("/health", self._health, methods=["GET"], response_model=HealthResponse)
        app.add_api_route(
            "/aggregate",
            self._aggregate,
            methods=["POST"],
            response_model=AggregateResponse,
        )

    async def _health(self) -> HealthResponse:
        uptime = round(max(0.0, time.time() - self._started_at), 3)
        return HealthResponse(status="ok", uptime_seconds=uptime)

    async def _aggregate(self, payload: AggregateRequest) -> AggregateResponse:
        if not payload.numbers:
            raise HTTPException(status_code=400, detail="numbers list cannot be empty")

        np_array = np.array(payload.numbers, dtype=float)
        series = pd.Series(np_array)
        response = AggregateResponse(
            count=int(series.count()),
            sum=float(series.sum()),
            mean=float(series.mean()),
            median=float(median(series.tolist())),
            min=float(series.min()),
            max=float(series.max()),
        )
        return response


@dataclass
class ServiceArgs:
    host: str
    port: int


def parse_args(argv: Sequence[str] | None = None) -> ServiceArgs:
    parser = argparse.ArgumentParser(description="Number Helper Service")
    parser.add_argument("--host", default="localhost", help="Interface for FastAPI to bind")
    parser.add_argument("--port", type=int, default=8001, help="TCP port for FastAPI")
    parsed = parser.parse_args(argv)
    return ServiceArgs(host=parsed.host, port=parsed.port)


def run(argv: Sequence[str] | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(message)s')
    service = NumberHelperService()
    cli_args = parse_args(argv)
    logging.info("Starting NumberHelperService on %s:%s", cli_args.host, cli_args.port)
    uvicorn.run(service.app, host=cli_args.host, port=cli_args.port, log_level="info")


if __name__ == "__main__":
    run()
