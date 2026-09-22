"""AuditLog model — 21 CFR Part 11 compliant immutable audit trail ledger."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)

    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE, LOGIN, EXPORT, APPROVE, REJECT
    entity_type = Column(String(100), nullable=False, index=True)  # TRIAL, PARTICIPANT, ADVERSE_EVENT, ETHICS_REVIEW, DOCUMENT, USER
    entity_id = Column(String(100), nullable=True, index=True)

    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    reason_for_change = Column(String(500), nullable=True)  # Compliance: explanation for edit

    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
