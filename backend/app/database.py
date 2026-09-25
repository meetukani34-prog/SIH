"""AyurCTMS — Database Engine & Session.
Supports Supabase PostgreSQL in production and SQLite for zero-config local demo/testing.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

import os
from sqlalchemy.pool import NullPool

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = db_url.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
else:
    is_serverless = os.getenv("VERCEL", "0") == "1"
    if is_serverless:
        engine = create_engine(
            db_url,
            poolclass=NullPool,
            pool_pre_ping=True,
            echo=settings.DEBUG,
        )
    else:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            echo=settings.DEBUG,
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
