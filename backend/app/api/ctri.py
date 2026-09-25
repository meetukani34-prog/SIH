"""CTRI Registration & Completeness Verification API endpoints."""

from typing import Dict, Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trial import Trial
from app.models.user import User
from app.auth.dependencies import get_optional_current_user
from app.services.ctri_service import calculate_ctri_completeness

router = APIRouter(prefix="/ctri", tags=["CTRI Registration & Completeness"])


@router.get("/completeness/{trial_id}")
def get_ctri_completeness_report(
    trial_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Evaluate clinical trial data against statutory CTRI registration standards."""
    # Match by UUID or study_id
    trial = None
    try:
        uuid_val = UUID(trial_id)
        trial = db.query(Trial).filter(Trial.id == uuid_val).first()
    except ValueError:
        trial = db.query(Trial).filter(Trial.study_id == trial_id).first()

    if not trial:
        raise HTTPException(status_code=404, detail="Clinical trial not found")

    return calculate_ctri_completeness(trial)
