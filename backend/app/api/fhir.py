"""HL7 FHIR R4 REST API Router.
Provides official FHIR R4 endpoints for:
- AdverseEvent (/api/fhir/AdverseEvent)
- ResearchStudy (/api/fhir/ResearchStudy)
- Bundle (/api/fhir/Bundle/{trial_id})
"""

import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent
from app.models.user import User
from app.services.fhir_service import (
    to_fhir_adverse_event,
    to_fhir_research_study,
    generate_trial_fhir_bundle
)

router = APIRouter(prefix="/fhir", tags=["HL7 FHIR R4 Interoperability"])


@router.get("/AdverseEvent", summary="List AdverseEvents in HL7 FHIR R4 Format")
def list_fhir_adverse_events(
    trial_id: Optional[str] = None,
    severity: Optional[str] = None,
    is_serious: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve clinical adverse events formatted as standard HL7 FHIR R4 AdverseEvent resources."""
    query = db.query(AdverseEvent)

    if trial_id:
        try:
            trial_uuid = uuid.UUID(trial_id)
            query = query.filter(AdverseEvent.trial_id == trial_uuid)
        except ValueError:
            pass

    if severity:
        query = query.filter(AdverseEvent.severity == severity.upper())

    if is_serious is not None:
        query = query.filter(AdverseEvent.is_serious == is_serious)

    events = query.order_by(AdverseEvent.onset_date.desc()).limit(limit).all()

    # Pre-fetch participants and trials for fast mapping
    part_ids = {e.participant_id for e in events}
    trial_ids = {e.trial_id for e in events}

    participants = {p.id: p for p in db.query(Participant).filter(Participant.id.in_(part_ids)).all()}
    trials = {t.id: t for t in db.query(Trial).filter(Trial.id.in_(trial_ids)).all()}

    fhir_resources = []
    for ae in events:
        p = participants.get(ae.participant_id)
        t = trials.get(ae.trial_id)
        fhir_resources.append(to_fhir_adverse_event(ae, participant=p, trial=t))

    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(fhir_resources),
        "entry": [{"fullUrl": f"urn:uuid:{r['id']}", "resource": r} for r in fhir_resources]
    }


@router.get("/AdverseEvent/{id}", summary="Get single AdverseEvent in HL7 FHIR R4 Format")
def get_fhir_adverse_event(id: str, db: Session = Depends(get_db)):
    """Retrieve a single AdverseEvent in exact HL7 FHIR R4 JSON structure."""
    try:
        ae_uuid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_uuid).first()
    if not ae:
        raise HTTPException(status_code=404, detail="AdverseEvent not found")

    participant = db.query(Participant).filter(Participant.id == ae.participant_id).first()
    trial = db.query(Trial).filter(Trial.id == ae.trial_id).first()

    return to_fhir_adverse_event(ae, participant=participant, trial=trial)


@router.get("/ResearchStudy", summary="List ResearchStudies in HL7 FHIR R4 Format")
def list_fhir_research_studies(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve clinical trials formatted as standard HL7 FHIR R4 ResearchStudy resources."""
    query = db.query(Trial)
    if status:
        query = query.filter(Trial.status == status.upper())

    trials = query.order_by(Trial.start_date.desc()).limit(limit).all()
    fhir_resources = [to_fhir_research_study(t) for t in trials]

    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(fhir_resources),
        "entry": [{"fullUrl": f"urn:uuid:{r['id']}", "resource": r} for r in fhir_resources]
    }


@router.get("/ResearchStudy/{id}", summary="Get single ResearchStudy in HL7 FHIR R4 Format")
def get_fhir_research_study(id: str, db: Session = Depends(get_db)):
    """Retrieve a single clinical trial in exact HL7 FHIR R4 ResearchStudy structure."""
    try:
        trial_uuid = uuid.UUID(id)
        trial = db.query(Trial).filter(Trial.id == trial_uuid).first()
    except ValueError:
        # Check by study_id or ctri_number
        trial = db.query(Trial).filter((Trial.study_id == id) | (Trial.ctri_number == id)).first()

    if not trial:
        raise HTTPException(status_code=404, detail="ResearchStudy not found")

    return to_fhir_research_study(trial)


@router.get("/Bundle/{trial_id}", summary="Get Complete HL7 FHIR R4 Collection Bundle")
def get_fhir_trial_bundle(trial_id: str, db: Session = Depends(get_db)):
    """Generate and return an official HL7 FHIR R4 Collection Bundle with ResearchStudy, ResearchSubject, AdverseEvent, and Consent."""
    bundle = generate_trial_fhir_bundle(db, trial_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="Trial not found or bundle generation failed")
    return bundle
