"""Adverse Events & Pharmacovigilance API endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.adverse_event import AdverseEvent
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.user import User
from app.schemas.adverse_event import AdverseEventCreate, AdverseEventUpdate, AdverseEventResponse
from app.schemas.dashboard import SaeAlert
from app.auth.dependencies import get_current_user, require_roles, get_client_info
from app.services.sae_service import process_new_adverse_event, get_sae_hours_remaining
from app.services.audit_service import log_action

router = APIRouter(prefix="/adverse-events", tags=["Adverse Events & Pharmacovigilance"])


@router.get("", response_model=List[AdverseEventResponse])
def get_adverse_events(
    trial_id: Optional[UUID] = None,
    participant_id: Optional[UUID] = None,
    is_serious: Optional[bool] = None,
    sae_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List adverse events with optional filtering."""
    query = db.query(AdverseEvent).options(
        joinedload(AdverseEvent.participant),
        joinedload(AdverseEvent.trial),
        joinedload(AdverseEvent.reporter),
    )
    if trial_id:
        query = query.filter(AdverseEvent.trial_id == trial_id)
    if participant_id:
        query = query.filter(AdverseEvent.participant_id == participant_id)
    if is_serious is not None:
        query = query.filter(AdverseEvent.is_serious == is_serious)
    if sae_status:
        query = query.filter(AdverseEvent.sae_status == sae_status)
    
    events = query.order_by(AdverseEvent.onset_date.desc()).offset(skip).limit(limit).all()

    # Populate joined helper fields
    results = []
    for ae in events:
        ae_dict = AdverseEventResponse.model_validate(ae).model_dump()
        if ae.participant:
            ae_dict["participant_code"] = ae.participant.participant_code
        if ae.trial:
            ae_dict["trial_study_id"] = ae.trial.study_id
        if ae.reporter:
            ae_dict["reporter_name"] = ae.reporter.name
        results.append(AdverseEventResponse(**ae_dict))
    
    return results


@router.post("", response_model=AdverseEventResponse, status_code=status.HTTP_201_CREATED)
def create_adverse_event(
    ae_data: AdverseEventCreate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "PV", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Record an adverse event. If serious, initiates statutory countdown and triggers immediate stakeholder alerts."""
    trial = db.query(Trial).filter(Trial.id == ae_data.trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    participant = db.query(Participant).filter(Participant.id == ae_data.participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    ae_dict = ae_data.model_dump()
    ae = AdverseEvent(**ae_dict)
    ae.reported_by_id = current_user.id

    # Process SAE countdown and automated alerts
    ae = process_new_adverse_event(db, ae)

    db.add(ae)
    db.commit()
    db.refresh(ae)

    client_info = get_client_info(request)
    log_action(
        db, action="CREATE", entity_type="ADVERSE_EVENT",
        entity_id=str(ae.id),
        new_values={
            "event_term": ae.event_term,
            "is_serious": ae.is_serious,
            "severity": ae.severity,
            "sae_status": ae.sae_status,
            "trial_id": str(ae.trial_id),
            "participant_id": str(ae.participant_id)
        },
        reason_for_change="Safety observation recorded",
        user=current_user,
        client_info=client_info
    )

    resp_dict = AdverseEventResponse.model_validate(ae).model_dump()
    resp_dict["participant_code"] = participant.participant_code
    resp_dict["trial_study_id"] = trial.study_id
    resp_dict["reporter_name"] = current_user.name
    return AdverseEventResponse(**resp_dict)


@router.get("/sae/active-countdown", response_model=List[SaeAlert])
def get_sae_countdown_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all active SAEs with live countdown hours remaining."""
    active_saes = db.query(AdverseEvent).filter(
        AdverseEvent.is_serious == True,
        AdverseEvent.sae_status.in_(["PENDING_24H", "OVERDUE"])
    ).all()

    alerts = []
    now = datetime.now(timezone.utc)
    for ae in active_saes:
        hours = get_sae_hours_remaining(ae.sae_deadline)
        # Auto-update status to OVERDUE if deadline has passed
        if hours is not None and hours < 0 and ae.sae_status != "OVERDUE":
            ae.sae_status = "OVERDUE"
            db.commit()

        trial = db.query(Trial).filter(Trial.id == ae.trial_id).first()
        participant = db.query(Participant).filter(Participant.id == ae.participant_id).first()

        alerts.append(SaeAlert(
            id=ae.id,
            trial_id=ae.trial_id,
            study_id=trial.study_id if trial else "Unknown",
            participant_code=participant.participant_code if participant else "Unknown",
            event_term=ae.event_term,
            severity=ae.severity,
            onset_date=ae.onset_date,
            sae_deadline=ae.sae_deadline,
            hours_remaining=hours,
            sae_status=ae.sae_status
        ))

    return sorted(alerts, key=lambda x: (x.hours_remaining if x.hours_remaining is not None else 999))


@router.get("/{ae_id}", response_model=AdverseEventResponse)
def get_adverse_event(
    ae_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve single adverse event details."""
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
    if not ae:
        raise HTTPException(status_code=404, detail="Adverse event not found")
    
    resp_dict = AdverseEventResponse.model_validate(ae).model_dump()
    if ae.participant:
        resp_dict["participant_code"] = ae.participant.participant_code
    if ae.trial:
        resp_dict["trial_study_id"] = ae.trial.study_id
    if ae.reporter:
        resp_dict["reporter_name"] = ae.reporter.name
    return AdverseEventResponse(**resp_dict)


@router.put("/{ae_id}", response_model=AdverseEventResponse)
def update_adverse_event(
    ae_id: UUID,
    update_data: AdverseEventUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "PV", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Update adverse event causality, outcome, or statutory status with reason for change."""
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
    if not ae:
        raise HTTPException(status_code=404, detail="Adverse event not found")

    old_values = {
        "severity": ae.severity,
        "is_serious": ae.is_serious,
        "causality": ae.causality,
        "outcome": ae.outcome,
        "sae_status": ae.sae_status
    }

    update_dict = update_data.model_dump(exclude_unset=True)
    reason = update_dict.pop("reason_for_change", "Safety assessment revision")

    for k, v in update_dict.items():
        setattr(ae, k, v)

    db.commit()
    db.refresh(ae)

    client_info = get_client_info(request)
    log_action(
        db, action="UPDATE", entity_type="ADVERSE_EVENT",
        entity_id=str(ae.id),
        old_values=old_values,
        new_values=update_dict,
        reason_for_change=reason,
        user=current_user,
        client_info=client_info
    )

    resp_dict = AdverseEventResponse.model_validate(ae).model_dump()
    if ae.participant:
        resp_dict["participant_code"] = ae.participant.participant_code
    if ae.trial:
        resp_dict["trial_study_id"] = ae.trial.study_id
    if ae.reporter:
        resp_dict["reporter_name"] = ae.reporter.name
    return AdverseEventResponse(**resp_dict)
