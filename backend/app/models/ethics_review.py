"""EthicsReview model — institutional ethics committee compliance and approvals."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class EthicsReview(Base):
    __tablename__ = "ethics_reviews"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=False, index=True)
    reviewer_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    committee_name = Column(String(255), nullable=False)
    review_type = Column(String(100), nullable=False)  # INITIAL, AMENDMENT, ANNUAL_CONTINUATION, SAE_REVIEW
    status = Column(String(50), nullable=False, default="SUBMITTED", index=True)  # SUBMITTED, UNDER_REVIEW, APPROVED, CONDITIONAL, REJECTED, LAPSED
    
    submission_date = Column(Date, nullable=False)
    decision_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    protocol_version_reviewed = Column(String(50), nullable=True)
    comments = Column(Text, nullable=True)
    conditions = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial", back_populates="ethics_reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
