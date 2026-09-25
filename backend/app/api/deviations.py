"""Protocol Deviations & CAPA Management API endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.protocol_deviation import ProtocolDeviation
from app.models.trial import Trial
from app.models.user import User
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/deviations", tags=["Protocol Deviations & CAPA"])


class DeviationCreate(BaseModel):
    trial_id: UUID
    participant_id: Optional[UUID] = None
    title: str
    description: str
    severity: str = "MINOR"  # MINOR, MAJOR, CRITICAL
    category: str = "PROCEDURAL"
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None


class DeviationResolve(BaseModel):
    corrective_action: str
    reason_for_change: str = "CAPA implementation and verification"


@router.get("")
def list_deviations(
    trial_id: Optional[UUID] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve protocol deviations with filtering."""
    query = db.query(ProtocolDeviation)
    if trial_id:
        query = query.filter(ProtocolDeviation.trial_id == trial_id)
    if severity:
        query = query.filter(ProtocolDeviation.severity == severity.upper())
    if status:
        query = query.filter(ProtocolDeviation.status == status.upper())
    
    deviations = query.order_by(ProtocolDeviation.deviation_date.desc()).offset(skip).limit(limit).all()
    
    results = []
    for d in deviations:
        results.append({
            "id": str(d.id),
            "deviation_code": d.deviation_code,
            "trial_id": str(d.trial_id),
            "study_id": d.trial.study_id if d.trial else "UNKNOWN",
            "participant_code": d.participant.participant_code if d.participant else "N/A",
            "title": d.title,
            "description": d.description,
            "deviation_date": d.deviation_date.isoformat(),
            "severity": d.severity,
            "category": d.category,
            "root_cause": d.root_cause,
            "corrective_action": d.corrective_action,
            "status": d.status,
            "resolution_date": d.resolution_date.isoformat() if d.resolution_date else None,
            "created_at": d.created_at.isoformat(),
        })
    return results


@router.put("/{deviation_id}/resolve")
def resolve_deviation(
    deviation_id: UUID,
    payload: DeviationResolve,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Resolve a protocol deviation by confirming CAPA execution."""
    dev = db.query(ProtocolDeviation).filter(ProtocolDeviation.id == deviation_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Protocol deviation not found")

    dev.status = "RESOLVED"
    dev.corrective_action = payload.corrective_action
    dev.resolution_date = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        action="UPDATE",
        entity_type="PROTOCOL_DEVIATION",
        entity_id=str(dev.id),
        new_values={"status": "RESOLVED", "corrective_action": dev.corrective_action},
        reason_for_change=payload.reason_for_change,
        user=current_user
    )

    return {"status": "success", "message": f"Deviation {dev.deviation_code} successfully resolved with CAPA."}
