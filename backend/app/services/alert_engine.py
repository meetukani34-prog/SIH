"""AIIA Clinical Research Command Center — Dynamic Alert & Risk Engine."""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.trial import Trial
from app.models.adverse_event import AdverseEvent
from app.models.ethics_review import EthicsReview
from app.models.protocol_deviation import ProtocolDeviation
from app.models.data_quality import DataQualityQuery


def evaluate_system_alerts(db: Session, trial_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Run real-time rule engine across all clinical trial data to generate actionable risk alerts."""
    alerts: List[Dict[str, Any]] = []
    now = datetime.now(timezone.utc)

    # Base query for trials
    trial_query = db.query(Trial)
    if trial_id:
        trial_query = trial_query.filter(Trial.id == trial_id)
    trials = trial_query.all()

    for trial in trials:
        # Rule 1: Recruitment Lag Alert
        if trial.status == "ACTIVE" and trial.target_sample_size and trial.target_sample_size > 0:
            target = trial.target_sample_size
            enrolled = trial.enrolled_count or 0
            ratio = enrolled / target
            
            if ratio < 0.50:
                alerts.append({
                    "id": f"rec-lag-{trial.id}",
                    "alert_type": "RECRUITMENT_LAG",
                    "study_id": trial.study_id,
                    "study_title": trial.title[:60] + "...",
                    "severity": "CRITICAL" if ratio < 0.35 else "HIGH",
                    "title": f"🔴 Severe Recruitment Lag Detected ({enrolled}/{target})",
                    "message": f"Study '{trial.study_id}' enrollment is at {round(ratio * 100, 1)}% of target ({enrolled} of {target} subjects). Site recruitment interventions required.",
                    "assigned_person": "Study Coordinator / PI",
                    "deadline": (now + timedelta(days=14)).strftime("%Y-%m-%d"),
                    "status": "OPEN",
                    "created_at": now.isoformat(),
                })
            elif ratio < 0.75:
                alerts.append({
                    "id": f"rec-warn-{trial.id}",
                    "alert_type": "RECRUITMENT_PACE",
                    "study_id": trial.study_id,
                    "study_title": trial.title[:60] + "...",
                    "severity": "WARNING",
                    "title": f"🟡 Recruitment Pacing Below Target ({enrolled}/{target})",
                    "message": f"Study '{trial.study_id}' is operating at {round(ratio * 100, 1)}% recruitment capacity.",
                    "assigned_person": "Principal Investigator",
                    "deadline": (now + timedelta(days=30)).strftime("%Y-%m-%d"),
                    "status": "OPEN",
                    "created_at": now.isoformat(),
                })

        # Rule 2: Ethics Approval Expiry Alert
        if trial.ethics_renewal_date:
            renewal_dt = datetime.combine(trial.ethics_renewal_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            days_left = (renewal_dt - now).days
            if days_left <= 14:
                alerts.append({
                    "id": f"eth-crit-{trial.id}",
                    "alert_type": "ETHICS_EXPIRY",
                    "study_id": trial.study_id,
                    "study_title": trial.title[:60] + "...",
                    "severity": "CRITICAL" if days_left <= 7 else "HIGH",
                    "title": f"⚠️ Ethics Approval Expiring in {max(0, days_left)} Days",
                    "message": f"Annual Institutional Ethics Committee (IEC) clearance for '{trial.study_id}' must be renewed before {trial.ethics_renewal_date}.",
                    "assigned_person": "Ethics Committee Liaison",
                    "deadline": trial.ethics_renewal_date.strftime("%Y-%m-%d"),
                    "status": "OPEN",
                    "created_at": now.isoformat(),
                })
            elif days_left <= 45:
                alerts.append({
                    "id": f"eth-warn-{trial.id}",
                    "alert_type": "ETHICS_RENEWAL",
                    "study_id": trial.study_id,
                    "study_title": trial.title[:60] + "...",
                    "severity": "WARNING",
                    "title": f"🟡 IEC Renewal Submission Window Open ({days_left}d remaining)",
                    "message": f"Prepare continuation dossier for IEC renewal submission.",
                    "assigned_person": "Study Coordinator",
                    "deadline": trial.ethics_renewal_date.strftime("%Y-%m-%d"),
                    "status": "OPEN",
                    "created_at": now.isoformat(),
                })

        # Rule 3: CTRI Registration / Update Status Alert
        if not trial.ctri_number and trial.status in ["ACTIVE", "ENROLLING"]:
            alerts.append({
                "id": f"ctri-missing-{trial.id}",
                "alert_type": "CTRI_MANDATORY",
                "study_id": trial.study_id,
                "study_title": trial.title[:60] + "...",
                "severity": "CRITICAL",
                "title": "🔴 Missing CTRI Mandatory Registration Number",
                "message": f"Study '{trial.study_id}' is active without a verified CTRI registration ID, violating Schedule Y regulations.",
                "assigned_person": "Regulatory Officer",
                "deadline": (now + timedelta(days=7)).strftime("%Y-%m-%d"),
                "status": "OPEN",
                "created_at": now.isoformat(),
            })

    # Rule 4: Serious Adverse Event (SAE) Statutory 24-Hour Reporting Alerts
    active_saes = (
        db.query(AdverseEvent)
        .filter(
            AdverseEvent.is_serious == True,
            AdverseEvent.sae_status.in_(["PENDING_24H", "OVERDUE"])
        )
        .all()
    )

    for sae in active_saes:
        hours_remaining = None
        if sae.sae_deadline:
            delta = sae.sae_deadline - now
            hours_remaining = round(delta.total_seconds() / 3600, 1)

        is_overdue = hours_remaining is not None and hours_remaining < 0
        alerts.append({
            "id": f"sae-alert-{sae.id}",
            "alert_type": "SAE_STATUTORY_DEADLINE",
            "study_id": sae.trial.study_id if sae.trial else "UNKNOWN",
            "study_title": sae.trial.title[:50] + "..." if sae.trial else "Clinical Trial",
            "severity": "CRITICAL",
            "title": f"🚨 STATUTORY SAE 24H CLOCK: {sae.event_term} ({'OVERDUE' if is_overdue else f'{hours_remaining}h left'})",
            "message": f"CDSCO & AYUSH Pharmacovigilance regulatory report submission required for subject {sae.participant.participant_code if sae.participant else 'Subject'}.",
            "assigned_person": "Pharmacovigilance Officer",
            "deadline": sae.sae_deadline.strftime("%Y-%m-%d %H:%M UTC") if sae.sae_deadline else "IMMEDIATE",
            "status": "OVERDUE" if is_overdue else "PENDING_REVIEW",
            "created_at": sae.created_at.isoformat() if sae.created_at else now.isoformat(),
        })

    # Rule 5: Critical Protocol Deviations Alert
    critical_devs = db.query(ProtocolDeviation).filter(
        ProtocolDeviation.severity == "CRITICAL",
        ProtocolDeviation.status != "RESOLVED"
    ).all()

    for dev in critical_devs:
        alerts.append({
            "id": f"dev-crit-{dev.id}",
            "alert_type": "PROTOCOL_DEVIATION",
            "study_id": dev.trial.study_id if dev.trial else "UNKNOWN",
            "study_title": dev.title,
            "severity": "HIGH",
            "title": f"⚠️ Critical Protocol Deviation: {dev.title}",
            "message": f"CAPA required: {dev.description[:120]}...",
            "assigned_person": "Quality Assurance / Monitor",
            "deadline": (now + timedelta(days=5)).strftime("%Y-%m-%d"),
            "status": dev.status,
            "created_at": dev.created_at.isoformat() if dev.created_at else now.isoformat(),
        })

    # Rule 6: Open Critical Data Queries Alert
    crit_queries_count = db.query(DataQualityQuery).filter(
        DataQualityQuery.severity == "CRITICAL",
        DataQualityQuery.status == "OPEN"
    ).count()

    if crit_queries_count > 0:
        alerts.append({
            "id": "crit-queries-summary",
            "alert_type": "DATA_DISCREPANCY",
            "study_id": "MULTIPLE",
            "study_title": "All India Clinical Database",
            "severity": "HIGH",
            "title": f"📋 {crit_queries_count} Unresolved Critical Data Queries",
            "message": "Clinical data locking is blocked by unresolved critical queries in eCRF records.",
            "assigned_person": "Clinical Data Manager",
            "deadline": (now + timedelta(days=7)).strftime("%Y-%m-%d"),
            "status": "OPEN",
            "created_at": now.isoformat(),
        })

    # Sort alerts by severity: CRITICAL first, then HIGH, WARNING, NORMAL
    severity_rank = {"CRITICAL": 0, "HIGH": 1, "WARNING": 2, "NORMAL": 3}
    alerts.sort(key=lambda a: severity_rank.get(a.get("severity", "NORMAL"), 4))

    return alerts
