"""Dashboard analytics and metrics Pydantic schemas."""

from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from uuid import UUID
from datetime import datetime


class TrialMetric(BaseModel):
    id: UUID
    study_id: str
    title: str
    status: str
    phase: Optional[str]
    enrolled: int
    target: Optional[int]
    sae_count: int


class SaeAlert(BaseModel):
    id: UUID
    trial_id: UUID
    study_id: str
    participant_code: str
    event_term: str
    severity: str
    onset_date: datetime
    sae_deadline: Optional[datetime]
    hours_remaining: Optional[float]
    sae_status: str


class StatusDistribution(BaseModel):
    status: str
    count: int


class DashboardMetrics(BaseModel):
    total_trials: int
    active_trials: int
    total_participants: int
    total_adverse_events: int
    active_saes: int
    overdue_saes: int
    pending_ethics_reviews: int
    compliance_score: float
    trials_by_status: List[StatusDistribution]
    ae_by_severity: List[StatusDistribution]
    urgent_sae_alerts: List[SaeAlert]
    recent_trials: List[TrialMetric]
