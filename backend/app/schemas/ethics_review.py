"""EthicsReview Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from app.schemas.user import UserResponse


class EthicsReviewBase(BaseModel):
    trial_id: UUID
    committee_name: str
    review_type: str  # INITIAL, AMENDMENT, ANNUAL_CONTINUATION, SAE_REVIEW
    status: Optional[str] = "SUBMITTED"
    submission_date: date
    decision_date: Optional[date] = None
    expiry_date: Optional[date] = None
    protocol_version_reviewed: Optional[str] = None
    comments: Optional[str] = None
    conditions: Optional[str] = None


class EthicsReviewCreate(EthicsReviewBase):
    pass


class EthicsReviewUpdate(BaseModel):
    committee_name: Optional[str] = None
    review_type: Optional[str] = None
    status: Optional[str] = None
    decision_date: Optional[date] = None
    expiry_date: Optional[date] = None
    comments: Optional[str] = None
    conditions: Optional[str] = None
    protocol_version_reviewed: Optional[str] = None
    reason_for_change: Optional[str] = None


class EthicsReviewResponse(EthicsReviewBase):
    id: UUID
    reviewer_id: Optional[UUID] = None
    trial_study_id: Optional[str] = None
    trial_title: Optional[str] = None
    reviewer: Optional[UserResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
