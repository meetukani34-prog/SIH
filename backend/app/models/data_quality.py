"""DataQualityQuery model — discrepancy management and query resolution."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class DataQualityQuery(Base):
    __tablename__ = "data_quality_queries"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    query_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. QRY-1042
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False, index=True)
    participant_id = Column(Uuid, ForeignKey("participants.id"), nullable=True)
    raised_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    field_name = Column(String(100), nullable=False)  # e.g. "baseline_dosha_score", "visit_date"
    issue_type = Column(String(50), nullable=False, default="MISSING")  # MISSING, INCONSISTENT, OUT_OF_RANGE, DUPLICATE, LOGICAL_ERROR
    severity = Column(String(50), nullable=False, default="MEDIUM")  # LOW, MEDIUM, CRITICAL
    
    query_text = Column(Text, nullable=False)
    resolution_text = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="OPEN", index=True)  # OPEN, ANSWERED, RESOLVED, CANCELLED
    
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial")
    participant = relationship("Participant")
    raised_by = relationship("User", foreign_keys=[raised_by_id])
