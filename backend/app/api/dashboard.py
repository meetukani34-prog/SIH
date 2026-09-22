"""Dashboard & Analytical Intelligence API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent
from app.models.ethics_review import EthicsReview
from app.models.user import User
from app.schemas.dashboard import DashboardMetrics, TrialMetric, SaeAlert, StatusDistribution
from app.auth.dependencies import get_current_user
from app.services.sae_service import get_sae_hours_remaining

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])


@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compile aggregated operational, safety, and compliance telemetry."""
    total_trials = db.query(Trial).count()
    active_trials = db.query(Trial).filter(Trial.status == "ACTIVE").count()
    total_participants = db.query(Participant).count()
    total_adverse_events = db.query(AdverseEvent).count()
    
    active_saes = db.query(AdverseEvent).filter(
        AdverseEvent.is_serious == True,
        AdverseEvent.sae_status.in_(["PENDING_24H", "OVERDUE"])
    ).count()

    overdue_saes = db.query(AdverseEvent).filter(
        AdverseEvent.is_serious == True,
        AdverseEvent.sae_status == "OVERDUE"
    ).count()

    pending_ethics = db.query(EthicsReview).filter(
        EthicsReview.status.in_(["SUBMITTED", "UNDER_REVIEW"])
    ).count()

    # Compliance calculation
    total_reviews = db.query(EthicsReview).count()
    approved_reviews = db.query(EthicsReview).filter(EthicsReview.status == "APPROVED").count()
    compliance_score = round((approved_reviews / total_reviews * 100) if total_reviews > 0 else 98.5, 1)

    # Trials by status distribution
    status_counts = db.query(Trial.status, func.count(Trial.id)).group_by(Trial.status).all()
    trials_by_status = [StatusDistribution(status=s or "UNKNOWN", count=c) for s, c in status_counts]

    # AE by severity distribution
    severity_counts = db.query(AdverseEvent.severity, func.count(AdverseEvent.id)).group_by(AdverseEvent.severity).all()
    ae_by_severity = [StatusDistribution(status=sev or "UNKNOWN", count=c) for sev, c in severity_counts]

    # Urgent SAE Alerts
    raw_saes = db.query(AdverseEvent).filter(
        AdverseEvent.is_serious == True,
        AdverseEvent.sae_status.in_(["PENDING_24H", "OVERDUE"])
    ).order_by(AdverseEvent.onset_date.desc()).limit(5).all()

    urgent_sae_alerts = []
    for ae in raw_saes:
        hours = get_sae_hours_remaining(ae.sae_deadline)
        if hours is not None and hours < 0 and ae.sae_status != "OVERDUE":
            ae.sae_status = "OVERDUE"
            db.commit()

        trial = db.query(Trial).filter(Trial.id == ae.trial_id).first()
        participant = db.query(Participant).filter(Participant.id == ae.participant_id).first()

        urgent_sae_alerts.append(SaeAlert(
            id=ae.id,
            trial_id=ae.trial_id,
            study_id=trial.study_id if trial else "UNKNOWN",
            participant_code=participant.participant_code if participant else "UNKNOWN",
            event_term=ae.event_term,
            severity=ae.severity,
            onset_date=ae.onset_date,
            sae_deadline=ae.sae_deadline,
            hours_remaining=hours,
            sae_status=ae.sae_status
        ))

    # Recent Trials
    recent_raw = db.query(Trial).order_by(Trial.created_at.desc()).limit(6).all()
    recent_trials = []
    for t in recent_raw:
        sae_c = db.query(AdverseEvent).filter(
            AdverseEvent.trial_id == t.id,
            AdverseEvent.is_serious == True
        ).count()
        recent_trials.append(TrialMetric(
            id=t.id,
            study_id=t.study_id,
            title=t.title,
            status=t.status,
            phase=t.phase,
            enrolled=t.enrolled_count or 0,
            target=t.target_sample_size,
            sae_count=sae_c
        ))

    return DashboardMetrics(
        total_trials=total_trials,
        active_trials=active_trials,
        total_participants=total_participants,
        total_adverse_events=total_adverse_events,
        active_saes=active_saes,
        overdue_saes=overdue_saes,
        pending_ethics_reviews=pending_ethics,
        compliance_score=compliance_score,
        trials_by_status=trials_by_status,
        ae_by_severity=ae_by_severity,
        urgent_sae_alerts=urgent_sae_alerts,
        recent_trials=recent_trials
    )
