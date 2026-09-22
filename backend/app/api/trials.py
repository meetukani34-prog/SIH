"""Clinical Trials API endpoints."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent
from app.models.ethics_review import EthicsReview
from app.models.user import User
from app.schemas.trial import TrialCreate, TrialUpdate, TrialResponse, TrialSummary
from app.auth.dependencies import get_current_user, require_roles, get_client_info
from app.services.audit_service import log_action

router = APIRouter(prefix="/trials", tags=["Clinical Trials"])


@router.get("", response_model=List[TrialResponse])
def get_trials(
    status: Optional[str] = None,
    phase: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve list of clinical trials with optional filtering."""
    query = db.query(Trial)
    if status:
        query = query.filter(Trial.status == status)
    if phase:
        query = query.filter(Trial.phase == phase)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Trial.title.ilike(search_pattern)) | 
            (Trial.study_id.ilike(search_pattern)) |
            (Trial.intervention.ilike(search_pattern))
        )
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=TrialResponse, status_code=status.HTTP_201_CREATED)
def create_trial(
    trial_data: TrialCreate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Create a new clinical trial protocol (PI and ADMIN only)."""
    existing = db.query(Trial).filter(Trial.study_id == trial_data.study_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Study ID '{trial_data.study_id}' already exists"
        )

    trial_dict = trial_data.model_dump()
    if not trial_dict.get("principal_investigator_id"):
        trial_dict["principal_investigator_id"] = current_user.id

    trial = Trial(**trial_dict)
    db.add(trial)
    db.commit()
    db.refresh(trial)

    client_info = get_client_info(request)
    log_action(
        db, action="CREATE", entity_type="TRIAL",
        entity_id=str(trial.id),
        new_values={"study_id": trial.study_id, "title": trial.title, "status": trial.status},
        reason_for_change="Initial protocol entry",
        user=current_user,
        client_info=client_info
    )

    return trial


@router.get("/{trial_id}", response_model=TrialResponse)
def get_trial(
    trial_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed trial information."""
    trial = db.query(Trial).filter(Trial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    return trial


@router.put("/{trial_id}", response_model=TrialResponse)
def update_trial(
    trial_id: UUID,
    update_data: TrialUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Update trial details with mandatory reason_for_change audit logging."""
    trial = db.query(Trial).filter(Trial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    old_values = {
        "title": trial.title,
        "status": trial.status,
        "phase": trial.phase,
        "target_sample_size": trial.target_sample_size,
        "protocol_version": trial.protocol_version
    }

    update_dict = update_data.model_dump(exclude_unset=True)
    reason = update_dict.pop("reason_for_change", "Protocol revision")

    for key, value in update_dict.items():
        setattr(trial, key, value)

    db.commit()
    db.refresh(trial)

    client_info = get_client_info(request)
    log_action(
        db, action="UPDATE", entity_type="TRIAL",
        entity_id=str(trial.id),
        old_values=old_values,
        new_values=update_dict,
        reason_for_change=reason,
        user=current_user,
        client_info=client_info
    )

    return trial


@router.get("/{trial_id}/summary", response_model=TrialSummary)
def get_trial_summary(
    trial_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get high-level summary metrics for a trial."""
    trial = db.query(Trial).filter(Trial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    enrolled = db.query(Participant).filter(Participant.trial_id == trial.id).count()
    sae_count = db.query(AdverseEvent).filter(
        AdverseEvent.trial_id == trial.id,
        AdverseEvent.is_serious == True
    ).count()
    
    latest_review = db.query(EthicsReview).filter(
        EthicsReview.trial_id == trial.id
    ).order_by(EthicsReview.created_at.desc()).first()

    return TrialSummary(
        id=trial.id,
        study_id=trial.study_id,
        title=trial.title,
        short_title=trial.short_title,
        phase=trial.phase,
        status=trial.status,
        enrolled_count=enrolled,
        target_sample_size=trial.target_sample_size,
        sae_count=sae_count,
        ethics_status=latest_review.status if latest_review else "NO_SUBMISSION"
    )
