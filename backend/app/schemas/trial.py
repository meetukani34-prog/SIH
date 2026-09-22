"""Trial Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime
from app.schemas.user import UserResponse
from app.schemas.site import SiteResponse


class TrialBase(BaseModel):
    study_id: str
    ctri_number: Optional[str] = None
    title: str
    short_title: Optional[str] = None
    phase: Optional[str] = None
    study_type: Optional[str] = None
    intervention: Optional[str] = None
    indication: Optional[str] = None
    principal_investigator_id: Optional[UUID] = None
    site_id: Optional[UUID] = None
    target_sample_size: Optional[int] = None
    status: Optional[str] = "DRAFT"
    start_date: Optional[date] = None
    expected_completion_date: Optional[date] = None
    ethics_approval_date: Optional[date] = None
    ethics_renewal_date: Optional[date] = None
    protocol_version: Optional[str] = "1.0"


class TrialCreate(TrialBase):
    pass


class TrialUpdate(BaseModel):
    title: Optional[str] = None
    short_title: Optional[str] = None
    phase: Optional[str] = None
    study_type: Optional[str] = None
    intervention: Optional[str] = None
    indication: Optional[str] = None
    principal_investigator_id: Optional[UUID] = None
    site_id: Optional[UUID] = None
    target_sample_size: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    expected_completion_date: Optional[date] = None
    ethics_approval_date: Optional[date] = None
    ethics_renewal_date: Optional[date] = None
    protocol_version: Optional[str] = None
    reason_for_change: Optional[str] = None  # For audit trail compliance


class TrialResponse(TrialBase):
    id: UUID
    enrolled_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    principal_investigator: Optional[UserResponse] = None
    site: Optional[SiteResponse] = None

    class Config:
        from_attributes = True


class TrialSummary(BaseModel):
    id: UUID
    study_id: str
    title: str
    short_title: Optional[str] = None
    phase: Optional[str] = None
    status: str
    enrolled_count: int
    target_sample_size: Optional[int] = None
    sae_count: int = 0
    ethics_status: Optional[str] = None

    class Config:
        from_attributes = True
