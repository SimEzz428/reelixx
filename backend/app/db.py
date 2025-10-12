from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# For now we use a local SQLite file. We'll swap to Postgres later.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./reelixx.db")

# `check_same_thread=False` is needed for SQLite in dev with FastAPI/uvicorn reload.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Base class for ORM models."""
    pass


def get_db() -> Generator:
    """FastAPI dependency to get a DB session and ensure it's closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()