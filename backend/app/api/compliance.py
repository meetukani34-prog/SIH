"""Ethics & Statutory Compliance API endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ethics_review import EthicsReview
from app.models.trial import Trial
from app.models.user import User
from app.schemas.ethics_review import EthicsReviewCreate, EthicsReviewUpdate, EthicsReviewResponse
from app.auth.dependencies import get_current_user, require_roles, get_client_info
from app.services.audit_service import log_action

router = APIRouter(prefix="/compliance", tags=["Ethics & Compliance"])


@router.get("/reviews", response_model=List[EthicsReviewResponse])
def get_ethics_reviews(
    trial_id: Optional[UUID] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List ethics reviews with status filtering."""
    query = db.query(EthicsReview)
    if trial_id:
        query = query.filter(EthicsReview.trial_id == trial_id)
    if status:
        query = query.filter(EthicsReview.status == status)

    reviews = query.order_by(EthicsReview.submission_date.desc()).all()
    results = []
    for r in reviews:
        r_dict = EthicsReviewResponse.model_validate(r).model_dump()
        if r.trial:
            r_dict["trial_study_id"] = r.trial.study_id
            r_dict["trial_title"] = r.trial.title
        results.append(EthicsReviewResponse(**r_dict))
    return results


@router.post("/reviews", response_model=EthicsReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_ethics_review(
    review_data: EthicsReviewCreate,
    request: Request,
    current_user: User = Depends(require_roles(["PI", "ADMIN", "ETHICS"])),
    db: Session = Depends(get_db)
):
    """Submit a protocol or amendment for Institutional Ethics Committee review."""
    trial = db.query(Trial).filter(Trial.id == review_data.trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    review = EthicsReview(**review_data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)

    client_info = get_client_info(request)
    log_action(
        db, action="CREATE", entity_type="ETHICS_REVIEW",
        entity_id=str(review.id),
        new_values={
            "trial_id": str(review.trial_id),
            "committee_name": review.committee_name,
            "review_type": review.review_type,
            "status": review.status
        },
        reason_for_change="Ethics dossier submission",
        user=current_user,
        client_info=client_info
    )

    r_dict = EthicsReviewResponse.model_validate(review).model_dump()
    r_dict["trial_study_id"] = trial.study_id
    r_dict["trial_title"] = trial.title
    return EthicsReviewResponse(**r_dict)


@router.put("/reviews/{review_id}", response_model=EthicsReviewResponse)
def update_ethics_review(
    review_id: UUID,
    update_data: EthicsReviewUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["ETHICS", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Adjudicate ethics review (APPROVED, CONDITIONAL, REJECTED) with statutory audit recording."""
    review = db.query(EthicsReview).filter(EthicsReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Ethics review not found")

    old_values = {
        "status": review.status,
        "decision_date": str(review.decision_date) if review.decision_date else None,
        "conditions": review.conditions
    }

    update_dict = update_data.model_dump(exclude_unset=True)
    reason = update_dict.pop("reason_for_change", "Ethics Committee adjudication")

    review.reviewer_id = current_user.id
    for k, v in update_dict.items():
        setattr(review, k, v)

    # If approved, update the trial's ethics approval and renewal dates
    if review.status == "APPROVED" and review.decision_date:
        trial = db.query(Trial).filter(Trial.id == review.trial_id).first()
        if trial:
            trial.ethics_approval_date = review.decision_date
            trial.ethics_renewal_date = review.expiry_date or (review.decision_date + timedelta(days=365))
            if trial.status == "DRAFT":
                trial.status = "ACTIVE"

    db.commit()
    db.refresh(review)

    client_info = get_client_info(request)
    log_action(
        db, action="UPDATE", entity_type="ETHICS_REVIEW",
        entity_id=str(review.id),
        old_values=old_values,
        new_values=update_dict,
        reason_for_change=reason,
        user=current_user,
        client_info=client_info
    )

    r_dict = EthicsReviewResponse.model_validate(review).model_dump()
    if review.trial:
        r_dict["trial_study_id"] = review.trial.study_id
        r_dict["trial_title"] = review.trial.title
    return EthicsReviewResponse(**r_dict)


@router.get("/scorecard")
def get_compliance_scorecard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compute statutory compliance scorecard and review pipeline status."""
    total_reviews = db.query(EthicsReview).count()
    approved = db.query(EthicsReview).filter(EthicsReview.status == "APPROVED").count()
    pending = db.query(EthicsReview).filter(EthicsReview.status.in_(["SUBMITTED", "UNDER_REVIEW"])).count()
    conditional = db.query(EthicsReview).filter(EthicsReview.status == "CONDITIONAL").count()
    
    total_trials = db.query(Trial).count()
    active_trials = db.query(Trial).filter(Trial.status == "ACTIVE").count()

    compliance_rate = round((approved / total_reviews * 100) if total_reviews > 0 else 100.0, 1)

    return {
        "total_reviews": total_reviews,
        "approved": approved,
        "pending": pending,
        "conditional": conditional,
        "compliance_rate_percent": compliance_rate,
        "active_trials_monitored": active_trials,
        "total_trials": total_trials,
        "regulatory_framework": "ICMR Guidelines for Biomedical Research & AYUSH GCP"
    }
