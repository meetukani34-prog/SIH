"""Participant Visits & Schedule Compliance API endpoints."""

from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.participant_visit import ParticipantVisit
from app.models.participant import Participant
from app.models.user import User
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/visits", tags=["Participant Visits & Schedule"])


@router.get("/participant/{participant_id}")
def get_participant_visit_timeline(
    participant_id: UUID,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retrieve chronologically ordered protocol visit schedule for a trial participant."""
    visits = (
        db.query(ParticipantVisit)
        .filter(ParticipantVisit.participant_id == participant_id)
        .order_by(ParticipantVisit.visit_number.asc())
        .all()
    )

    results = []
    for v in visits:
        results.append({
            "id": str(v.id),
            "visit_number": v.visit_number,
            "visit_name": v.visit_name,
            "scheduled_day": v.scheduled_day,
            "window_days": v.window_days,
            "planned_date": v.planned_date.isoformat(),
            "actual_date": v.actual_date.isoformat() if v.actual_date else None,
            "status": v.status,
            "vitals_recorded": v.vitals_recorded,
            "dosha_assessment_completed": v.dosha_assessment_completed,
            "notes": v.notes,
        })
    return results
