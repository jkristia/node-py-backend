"""Shared Pydantic models for the Number Helper FastAPI service."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel


class AggregateRequest(BaseModel):
    numbers: List[float]


class AggregateResponse(BaseModel):
    count: int
    sum: float
    mean: float
    median: float
    min: float
    max: float


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
