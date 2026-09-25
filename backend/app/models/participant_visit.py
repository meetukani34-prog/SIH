"""ParticipantVisit model — protocol scheduled visits and timeline tracking."""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Integer, Uuid, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base


class ParticipantVisit(Base):
    __tablename__ = "participant_visits"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    participant_id = Column(Uuid, ForeignKey("participants.id"), nullable=False, index=True)
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False, index=True)

    visit_number = Column(Integer, nullable=False)  # 0 (Screening), 1, 2, 3...
    visit_name = Column(String(100), nullable=False)  # "Day 0 - Screening", "Day 7 - Baseline", "Day 30", etc.
    scheduled_day = Column(Integer, nullable=False, default=0)  # 0, 7, 30, 60, 90
    window_days = Column(Integer, nullable=False, default=3)  # +/- 3 days window
    
    planned_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="SCHEDULED")  # SCHEDULED, COMPLETED, MISSED, WINDOW_VIOLATION, CANCELLED
    
    notes = Column(Text, nullable=True)
    vitals_recorded = Column(Boolean, default=False)
    dosha_assessment_completed = Column(Boolean, default=False)
    adverse_event_reported = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    participant = relationship("Participant")
    trial = relationship("Trial")
