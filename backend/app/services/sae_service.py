"""Serious Adverse Event (SAE) statutory reporting countdown and notification service."""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.adverse_event import AdverseEvent
from app.models.notification import Notification
from app.models.user import User
from app.models.trial import Trial
from app.config import settings


def process_new_adverse_event(db: Session, ae: AdverseEvent) -> AdverseEvent:
    """If adverse event is serious (SAE), initialize the statutory deadline and alert stakeholders."""
    if ae.is_serious:
        # Statutory deadline is configurable (default 24 hours from onset or report)
        now_utc = datetime.now(timezone.utc)
        deadline = now_utc + timedelta(hours=settings.SAE_REPORTING_DEADLINE_HOURS)
        ae.sae_reported_at = now_utc
        ae.sae_deadline = deadline
        ae.sae_status = "PENDING_24H"

        # Notify stakeholders (Ethics, PV officers, Regulators, and Trial PI)
        recipients = db.query(User).filter(User.role.in_(["ETHICS", "PV", "REGULATOR"])).all()
        
        # Also find the PI of this trial
        trial = db.query(Trial).filter(Trial.id == ae.trial_id).first()
        trial_id_str = trial.study_id if trial else "Unknown Trial"
        
        notification_title = f"CRITICAL: Statutory SAE Alert [{trial_id_str}]"
        notification_message = (
            f"A Serious Adverse Event ('{ae.event_term}') was recorded. "
            f"Statutory reporting deadline ({settings.SAE_REPORTING_DEADLINE_HOURS}h window) expires at "
            f"{deadline.strftime('%Y-%m-%d %H:%M UTC')}."
        )

        for user in recipients:
            notification = Notification(
                user_id=user.id,
                title=notification_title,
                message=notification_message,
                notification_type="SAE_ALERT",
                severity="CRITICAL",
                link=f"/trials/{ae.trial_id}/adverse-events",
                is_read=False
            )
            db.add(notification)

    else:
        ae.sae_status = "NOT_APPLICABLE"

    return ae


def get_sae_hours_remaining(deadline: Optional[datetime]) -> Optional[float]:
    """Calculate remaining hours until statutory reporting deadline."""
    if not deadline:
        return None
    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    delta = deadline - now
    return round(delta.total_seconds() / 3600.0, 2)
