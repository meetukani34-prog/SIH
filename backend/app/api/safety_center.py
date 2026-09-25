"""Safety Center API endpoints — Safety Signals and End-to-End SAE Workflow Stepper."""

from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.adverse_event import AdverseEvent
from app.models.user import User
from app.auth.dependencies import get_optional_current_user
from app.services.signal_service import detect_safety_signals
from app.services.sae_service import get_sae_hours_remaining

router = APIRouter(prefix="/safety-center", tags=["AIIA National Pharmacovigilance Safety Center"])


@router.get("/signals")
def get_safety_signals(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retrieve statistical safety signals flagged for AIIA expert review."""
    return detect_safety_signals(db)


@router.get("/sae-workflow/{sae_id}")
def get_sae_workflow(
    sae_id: UUID,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the 7-step statutory SAE reporting lifecycle for an event."""
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == sae_id).first()
    if not ae:
        raise HTTPException(status_code=404, detail="Adverse Event record not found")

    hours_left = get_sae_hours_remaining(ae.sae_deadline)
    is_serious = ae.is_serious

    # Compute workflow steps
    steps = [
        {
            "step": 1,
            "title": "SAE Created",
            "description": f"Initial clinical event '{ae.event_term}' logged by site investigator.",
            "completed": True,
            "timestamp": ae.created_at.isoformat() if ae.created_at else None
        },
        {
            "step": 2,
            "title": "Automatic Classification",
            "description": f"Evaluated against Schedule Y serious criteria: {', '.join(ae.sae_criteria or ['Clinically Evaluated'])}.",
            "completed": True,
            "timestamp": ae.created_at.isoformat() if ae.created_at else None
        },
        {
            "step": 3,
            "title": "PV Team Notification",
            "description": "Statutory 24-hour countdown broadcast to AIIA Pharmacovigilance team.",
            "completed": True,
            "timestamp": ae.sae_reported_at.isoformat() if ae.sae_reported_at else None
        },
        {
            "step": 4,
            "title": "Pharmacovigilance (PV) Review",
            "description": f"MedDRA coding ({ae.meddra_code or 'Pending'}) verified by PV Officer.",
            "completed": ae.status in ["UNDER_REVIEW", "RESOLVED", "CLOSED"],
            "timestamp": None
        },
        {
            "step": 5,
            "title": "Medical & Causality Assessment",
            "description": f"WHO-UMC causality grade: {ae.causality or 'UNCLASSIFIED'}.",
            "completed": ae.causality in ["CERTAIN", "PROBABLE", "POSSIBLE", "UNLIKELY", "UNRELATED"],
            "timestamp": None
        },
        {
            "step": 6,
            "title": "Regulatory Reporting (CDSCO & AYUSH)",
            "description": "Formal CIOMS / AYUSH ADR dossier generation and transmission.",
            "completed": ae.sae_status in ["SUBMITTED_IN_TIME", "RESOLVED"],
            "timestamp": None
        },
        {
            "step": 7,
            "title": "Final Resolution & Ethics Close-out",
            "description": f"Clinical outcome documented: {ae.outcome or 'Pending'}.",
            "completed": ae.status in ["RESOLVED", "CLOSED"],
            "timestamp": ae.resolution_date.isoformat() if ae.resolution_date else None
        }
    ]

    return {
        "sae_id": str(ae.id),
        "study_id": ae.trial.study_id if ae.trial else "UNKNOWN",
        "participant_code": ae.participant.participant_code if ae.participant else "UNKNOWN",
        "event_term": ae.event_term,
        "is_serious": is_serious,
        "severity": ae.severity,
        "causality": ae.causality,
        "outcome": ae.outcome,
        "hours_remaining": hours_left,
        "sae_status": ae.sae_status,
        "steps": steps,
        "current_step": 7 if ae.status in ["RESOLVED", "CLOSED"] else (5 if ae.causality else (4 if ae.status == "UNDER_REVIEW" else 3))
    }
