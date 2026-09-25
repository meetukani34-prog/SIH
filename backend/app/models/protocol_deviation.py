"""ProtocolDeviation model — protocol non-compliance and CAPA tracking."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class ProtocolDeviation(Base):
    __tablename__ = "protocol_deviations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    deviation_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. DEV-2026-001
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False, index=True)
    participant_id = Column(Uuid, ForeignKey("participants.id"), nullable=True)
    reported_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    deviation_date = Column(DateTime(timezone=True), nullable=False)
    severity = Column(String(50), nullable=False, default="MINOR")  # MINOR, MAJOR, CRITICAL
    category = Column(String(100), nullable=False, default="PROCEDURAL")  # INCLUSION_CRITERIA, INFORMED_CONSENT, DOSING_ERROR, VISIT_WINDOW, SAFETY_REPORTING, PROCEDURAL
    
    root_cause = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=True)  # CAPA action plan
    status = Column(String(50), nullable=False, default="OPEN", index=True)  # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    
    resolution_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial")
    participant = relationship("Participant")
    reporter = relationship("User", foreign_keys=[reported_by_id])
