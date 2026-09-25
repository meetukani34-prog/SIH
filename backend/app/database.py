"""AyurCTMS — Database Engine & Session.
Supports Supabase PostgreSQL in production and SQLite for zero-config local demo/testing.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

import os
import re
import urllib.parse
from sqlalchemy.pool import NullPool

def normalize_db_url(raw_url: str) -> str:
    raw = (raw_url or "").strip()
    if raw.startswith("postgres://"):
        raw = "postgresql://" + raw[11:]
    
    # Handle user:pass@host with brackets or unencoded special characters in password
    match = re.match(r'^(postgresql(?:\+[a-zA-Z0-9_-]+)?://)([^:]+):(.*)@([^@]+)$', raw)
    if match:
        proto, user, pw, host = match.groups()
        pw = pw.strip('[]')
        # If password contains unencoded special characters like @, $, #
        if not re.search(r'%[0-9a-fA-F]{2}', pw):
            pw = urllib.parse.quote_plus(pw)
        return f"{proto}{user}:{pw}@{host}"
    return raw

db_url = normalize_db_url(settings.DATABASE_URL)
is_sqlite = db_url.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
else:
    is_serverless = os.getenv("VERCEL", "0") == "1"
    target_url = db_url

    # Check if psycopg2 driver is available
    has_psycopg2 = False
    try:
        import psycopg2
        has_psycopg2 = True
    except Exception:
        has_psycopg2 = False

    # On Vercel serverless or when psycopg2 is missing, pg8000 is 100% pure Python with zero C-lib dependencies
    if (is_serverless or not has_psycopg2) and target_url.startswith("postgresql://"):
        target_url = target_url.replace("postgresql://", "postgresql+pg8000://", 1)

    if is_serverless:
        engine = create_engine(
            target_url,
            pool_size=5,
            max_overflow=10,
            pool_recycle=120,
            pool_timeout=15,
            echo=False,
        )
    else:
        engine = create_engine(
            target_url,
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
