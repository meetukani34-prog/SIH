"""AdverseEvent model — clinical safety and pharmacovigilance tracking."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey, JSON, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class AdverseEvent(Base):
    __tablename__ = "adverse_events"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False, index=True)
    participant_id = Column(Uuid, ForeignKey("participants.id"), nullable=False, index=True)
    reported_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    event_term = Column(String(255), nullable=False)
    ayurvedic_term = Column(String(255), nullable=True)
    meddra_term = Column(String(255), nullable=True)
    meddra_code = Column(String(50), nullable=True)
    
    onset_date = Column(DateTime(timezone=True), nullable=False)
    resolution_date = Column(DateTime(timezone=True), nullable=True)
    severity = Column(String(50), nullable=False)  # MILD, MODERATE, SEVERE
    is_serious = Column(Boolean, default=False, nullable=False, index=True)  # SAE flag
    sae_criteria = Column(JSON, nullable=True)  # list of criteria e.g. ["HOSPITALIZATION"]
    
    causality = Column(String(50), nullable=True)  # CERTAIN, PROBABLE, POSSIBLE, UNLIKELY, UNRELATED, UNCLASSIFIED
    outcome = Column(String(50), nullable=True)    # RECOVERED, RECOVERING, NOT_RECOVERED, FATAL, UNKNOWN
    
    # SAE statutory reporting countdown
    sae_reported_at = Column(DateTime(timezone=True), nullable=True)
    sae_deadline = Column(DateTime(timezone=True), nullable=True)
    sae_status = Column(String(50), default="NOT_APPLICABLE")  # NOT_APPLICABLE, PENDING_24H, SUBMITTED_IN_TIME, OVERDUE

    action_taken = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # AI Assist fields
    ai_suggested_meddra = Column(String(255), nullable=True)
    ai_suggested_ayurvedic = Column(String(255), nullable=True)
    ai_confidence_score = Column(Float, nullable=True)

    status = Column(String(50), default="SUBMITTED", nullable=False)  # DRAFT, SUBMITTED, UNDER_REVIEW, RESOLVED, CLOSED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial", back_populates="adverse_events")
    participant = relationship("Participant", back_populates="adverse_events")
    reporter = relationship("User", foreign_keys=[reported_by_id])
