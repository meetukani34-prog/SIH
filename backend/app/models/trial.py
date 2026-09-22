"""Trial model — clinical trial management."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Trial(Base):
    __tablename__ = "trials"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    study_id = Column(String(50), unique=True, nullable=False, index=True)
    ctri_number = Column(String(100), nullable=True)
    title = Column(String(500), nullable=False)
    short_title = Column(String(200), nullable=True)
    phase = Column(String(50), nullable=True)  # Phase I, II, III, IV, Observational
    study_type = Column(String(100), nullable=True)
    intervention = Column(String(500), nullable=True)
    indication = Column(String(500), nullable=True)
    principal_investigator_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    site_id = Column(Uuid, ForeignKey("sites.id"), nullable=True)
    target_sample_size = Column(Integer, nullable=True)
    enrolled_count = Column(Integer, default=0)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)
    start_date = Column(Date, nullable=True)
    expected_completion_date = Column(Date, nullable=True)
    ethics_approval_date = Column(Date, nullable=True)
    ethics_renewal_date = Column(Date, nullable=True)
    protocol_version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    principal_investigator = relationship("User", back_populates="trials_as_pi", foreign_keys=[principal_investigator_id])
    site = relationship("Site", back_populates="trials")
    participants = relationship("Participant", back_populates="trial")
    adverse_events = relationship("AdverseEvent", back_populates="trial")
    ethics_reviews = relationship("EthicsReview", back_populates="trial")
    documents = relationship("Document", back_populates="trial")
