"""Pytest test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, get_db
from app.auth.security import create_access_token
from app.models.user import User


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def db_session():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="session")
def pi_token(db_session):
    user = db_session.query(User).filter(User.email == "pi@ayurctms.in").first()
    return create_access_token(data={"sub": str(user.id), "role": user.role})


@pytest.fixture(scope="session")
def ethics_token(db_session):
    user = db_session.query(User).filter(User.email == "ethics@ayurctms.in").first()
    return create_access_token(data={"sub": str(user.id), "role": user.role})


@pytest.fixture(scope="session")
def regulator_token(db_session):
    user = db_session.query(User).filter(User.email == "regulator@ayurctms.in").first()
    return create_access_token(data={"sub": str(user.id), "role": user.role})
