"""Document model — regulatory document vault with checksum integrity."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    trial_id = Column(Uuid, ForeignKey("trials.id"), nullable=True, index=True)
    uploaded_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    title = Column(String(255), nullable=False)
    doc_type = Column(String(100), nullable=False)  # PROTOCOL, INFORMED_CONSENT, ETHICS_APPROVAL, SAE_REPORT, REGULATORY_SUBMISSION, OTHER
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)  # bytes
    mime_type = Column(String(100), default="application/pdf")
    version = Column(String(50), default="1.0")
    
    checksum_sha256 = Column(String(64), nullable=True)  # Tamper-evidence SHA256
    is_vaulted = Column(Boolean, default=False)          # Locked against modification
    status = Column(String(50), default="ACTIVE")        # ACTIVE, ARCHIVED, SUPERSEDED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trial = relationship("Trial", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by_id])
