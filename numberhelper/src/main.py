"""CLI entry point for the Number Helper FastAPI service."""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from typing import Sequence

import uvicorn

from number_helper_service import NumberHelperService


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
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(message)s', force=True)
    service = NumberHelperService()
    cli_args = parse_args(argv)
    logging.info("Starting NumberHelperService on %s:%s", cli_args.host, cli_args.port)
    try:
        uvicorn.run(service.app, host=cli_args.host, port=cli_args.port, log_level="info")
    except KeyboardInterrupt:
        logging.info("NumberHelperService interrupted, shutting down")


if __name__ == "__main__":
    run()
