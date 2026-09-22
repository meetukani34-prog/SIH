"""Participant Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from app.schemas.site import SiteResponse


class ParticipantBase(BaseModel):
    participant_code: str  # AYU-XXXX
    trial_id: UUID
    site_id: Optional[UUID] = None
    age_group: Optional[str] = None  # e.g., "25-34"
    sex: Optional[str] = None       # M, F, Other
    enrollment_date: Optional[date] = None
    status: Optional[str] = "SCREENING"
    last_visit: Optional[date] = None
    next_visit: Optional[date] = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantUpdate(BaseModel):
    site_id: Optional[UUID] = None
    age_group: Optional[str] = None
    sex: Optional[str] = None
    enrollment_date: Optional[date] = None
    status: Optional[str] = None
    last_visit: Optional[date] = None
    next_visit: Optional[date] = None
    reason_for_change: Optional[str] = None


class ParticipantResponse(ParticipantBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    site: Optional[SiteResponse] = None

    class Config:
        from_attributes = True
