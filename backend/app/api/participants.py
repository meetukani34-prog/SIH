"""Participants API endpoints — pseudonymous cohort management."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.participant import Participant
from app.models.trial import Trial
from app.models.user import User
from app.schemas.participant import ParticipantCreate, ParticipantUpdate, ParticipantResponse
from app.auth.dependencies import get_current_user, require_roles, get_client_info
from app.services.audit_service import log_action

router = APIRouter(prefix="/participants", tags=["Participants"])


@router.get("", response_model=List[ParticipantResponse])
def get_participants(
    trial_id: Optional[UUID] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve pseudonymous participants filtered by trial and status."""
    query = db.query(Participant)
    if trial_id:
        query = query.filter(Participant.trial_id == trial_id)
    if status:
        query = query.filter(Participant.status == status)
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
def create_participant(
    participant_data: ParticipantCreate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Enroll a new participant with pseudonymous code (AYU-XXXX)."""
    # Verify trial exists
    trial = db.query(Trial).filter(Trial.id == participant_data.trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    # Verify participant code uniqueness
    existing = db.query(Participant).filter(
        Participant.participant_code == participant_data.participant_code
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Participant code '{participant_data.participant_code}' already exists"
        )

    participant = Participant(**participant_data.model_dump())
    db.add(participant)

    # Increment enrolled count in trial
    trial.enrolled_count = db.query(Participant).filter(Participant.trial_id == trial.id).count() + 1
    
    db.commit()
    db.refresh(participant)

    client_info = get_client_info(request)
    log_action(
        db, action="CREATE", entity_type="PARTICIPANT",
        entity_id=str(participant.id),
        new_values={
            "participant_code": participant.participant_code,
            "trial_id": str(participant.trial_id),
            "status": participant.status
        },
        reason_for_change="Participant enrollment",
        user=current_user,
        client_info=client_info
    )

    return participant


@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(
    participant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get participant details by ID."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p


@router.put("/{participant_id}", response_model=ParticipantResponse)
def update_participant(
    participant_id: UUID,
    update_data: ParticipantUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Update participant details with reason for change."""
    p = db.query(Participant).filter(Participant.id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    old_values = {
        "status": p.status,
        "last_visit": str(p.last_visit) if p.last_visit else None,
        "next_visit": str(p.next_visit) if p.next_visit else None
    }

    update_dict = update_data.model_dump(exclude_unset=True)
    reason = update_dict.pop("reason_for_change", "Clinical status update")

    for key, val in update_dict.items():
        setattr(p, key, val)

    db.commit()
    db.refresh(p)

    client_info = get_client_info(request)
    log_action(
        db, action="UPDATE", entity_type="PARTICIPANT",
        entity_id=str(p.id),
        old_values=old_values,
        new_values=update_dict,
        reason_for_change=reason,
        user=current_user,
        client_info=client_info
    )

    return p
