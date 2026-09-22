"""AdverseEvent Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class AdverseEventBase(BaseModel):
    trial_id: UUID
    participant_id: UUID
    event_term: str
    ayurvedic_term: Optional[str] = None
    meddra_term: Optional[str] = None
    meddra_code: Optional[str] = None
    onset_date: datetime
    resolution_date: Optional[datetime] = None
    severity: str  # MILD, MODERATE, SEVERE
    is_serious: bool = False
    sae_criteria: Optional[List[str]] = None
    causality: Optional[str] = None
    outcome: Optional[str] = None
    action_taken: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "SUBMITTED"


class AdverseEventCreate(AdverseEventBase):
    pass


class AdverseEventUpdate(BaseModel):
    ayurvedic_term: Optional[str] = None
    meddra_term: Optional[str] = None
    meddra_code: Optional[str] = None
    resolution_date: Optional[datetime] = None
    severity: Optional[str] = None
    is_serious: Optional[bool] = None
    sae_criteria: Optional[List[str]] = None
    causality: Optional[str] = None
    outcome: Optional[str] = None
    action_taken: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    sae_status: Optional[str] = None
    reason_for_change: Optional[str] = None


class AdverseEventResponse(AdverseEventBase):
    id: UUID
    reported_by_id: Optional[UUID] = None
    sae_reported_at: Optional[datetime] = None
    sae_deadline: Optional[datetime] = None
    sae_status: Optional[str] = None
    ai_suggested_meddra: Optional[str] = None
    ai_suggested_ayurvedic: Optional[str] = None
    ai_confidence_score: Optional[float] = None
    participant_code: Optional[str] = None
    trial_study_id: Optional[str] = None
    reporter_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TerminologySuggestRequest(BaseModel):
    term: str
    context: Optional[str] = None


class TerminologySuggestion(BaseModel):
    meddra_term: str
    meddra_code: str
    system_organ_class: str
    ayurvedic_correlate: Optional[str] = None
    ayurvedic_category: Optional[str] = None
    confidence_score: float
    notes: Optional[str] = None


class TerminologySuggestResponse(BaseModel):
    query: str
    suggestions: List[TerminologySuggestion]
    source: str = "AyurCTMS AI Terminology Harmonizer (Clinical Demo)"
