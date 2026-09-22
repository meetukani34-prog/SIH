"""Participant model — pseudonymous trial participants."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    participant_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. AYU-0012
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False)
    site_id = Column(Uuid, ForeignKey("sites.id"), nullable=True)
    age_group = Column(String(50), nullable=True)  # e.g. "25-34", "35-44"
    sex = Column(String(20), nullable=True)  # M, F, Other
    enrollment_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="SCREENING", index=True)
    last_visit = Column(Date, nullable=True)
    next_visit = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial", back_populates="participants")
    site = relationship("Site", back_populates="participants")
    adverse_events = relationship("AdverseEvent", back_populates="participant")
