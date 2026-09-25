"""Data Quality & Discrepancy Management API endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.data_quality import DataQualityQuery
from app.models.user import User
from app.auth.dependencies import get_optional_current_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/data-quality", tags=["Data Quality & Discrepancies"])


class QueryResolve(BaseModel):
    resolution_text: str
    reason_for_change: str = "Verified and resolved against primary medical source record"


@router.get("/queries")
def list_queries(
    trial_id: Optional[UUID] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve clinical data quality discrepancies and queries."""
    query = db.query(DataQualityQuery)
    if trial_id:
        query = query.filter(DataQualityQuery.trial_id == trial_id)
    if status:
        query = query.filter(DataQualityQuery.status == status.upper())
    if severity:
        query = query.filter(DataQualityQuery.severity == severity.upper())

    queries = query.order_by(DataQualityQuery.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for q in queries:
        results.append({
            "id": str(q.id),
            "query_code": q.query_code,
            "trial_id": str(q.trial_id),
            "study_id": q.trial.study_id if q.trial else "UNKNOWN",
            "participant_code": q.participant.participant_code if q.participant else "N/A",
            "field_name": q.field_name,
            "issue_type": q.issue_type,
            "severity": q.severity,
            "query_text": q.query_text,
            "resolution_text": q.resolution_text,
            "status": q.status,
            "resolved_at": q.resolved_at.isoformat() if q.resolved_at else None,
            "created_at": q.created_at.isoformat(),
        })
    return results


@router.put("/queries/{query_id}/resolve")
def resolve_query(
    query_id: UUID,
    payload: QueryResolve,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Resolve a clinical data query with reason for change."""
    q = db.query(DataQualityQuery).filter(DataQualityQuery.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Data quality query not found")

    q.status = "RESOLVED"
    q.resolution_text = payload.resolution_text
    q.resolved_at = datetime.now(timezone.utc)
    db.commit()

    log_action(
        db,
        action="UPDATE",
        entity_type="DATA_QUERY",
        entity_id=str(q.id),
        new_values={"status": "RESOLVED", "resolution_text": q.resolution_text},
        reason_for_change=payload.reason_for_change,
        user=current_user
    )

    return {"status": "success", "message": f"Query {q.query_code} successfully resolved."}
