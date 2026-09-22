"""User model — authentication and role-based access."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # PI, ETHICS, PV, REGULATOR, ADMIN
    institution = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trials_as_pi = relationship("Trial", back_populates="principal_investigator", foreign_keys="Trial.principal_investigator_id")
    notifications = relationship("Notification", back_populates="user")
