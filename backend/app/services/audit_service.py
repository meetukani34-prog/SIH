"""Audit trail service — records 21 CFR Part 11 compliant immutable ledger events."""

from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User


def log_action(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    old_values: Optional[Any] = None,
    new_values: Optional[Any] = None,
    reason_for_change: Optional[str] = None,
    user: Optional[User] = None,
    client_info: Optional[dict] = None
) -> AuditLog:
    """Write an audit entry to the audit_logs table."""
    client_info = client_info or {}
    audit_entry = AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else "system",
        user_role=user.role if user else "SYSTEM",
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        old_values=old_values,
        new_values=new_values,
        reason_for_change=reason_for_change,
        ip_address=client_info.get("ip_address"),
        user_agent=client_info.get("user_agent")
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
