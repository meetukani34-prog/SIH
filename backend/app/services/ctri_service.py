"""CTRI Tracking & Completeness Verification Service."""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.trial import Trial


def calculate_ctri_completeness(trial: Trial) -> Dict[str, Any]:
    """Evaluate a trial across 8 statutory CTRI dimensions and return completeness score."""
    checklist = [
        {
            "field": "Public Study Title",
            "required": True,
            "status": bool(trial.title and len(trial.title.strip()) > 10),
            "description": "Full scientific title with clear indication and target population."
        },
        {
            "field": "CTRI Registration Number",
            "required": True,
            "status": bool(trial.ctri_number and trial.ctri_number.startswith("CTRI/")),
            "description": "Official registration identifier granted by the National Institute of Medical Statistics."
        },
        {
            "field": "Ethics Committee Approval",
            "required": True,
            "status": bool(trial.ethics_approval_date or trial.ethics_reviews),
            "description": "Formal clearance from a registered Institutional Ethics Committee."
        },
        {
            "field": "Target Sample Size",
            "required": True,
            "status": bool(trial.target_sample_size and trial.target_sample_size > 0),
            "description": "Statistically justified sample size calculation."
        },
        {
            "field": "Intervention & Comparator Details",
            "required": True,
            "status": bool(trial.intervention and len(trial.intervention.strip()) > 5),
            "description": "Standardized botanical names, dosage, duration, and route of administration."
        },
        {
            "field": "Primary Clinical Indication",
            "required": True,
            "status": bool(trial.indication and len(trial.indication.strip()) > 3),
            "description": "Target disease condition coded to ICD-11 / MedDRA."
        },
        {
            "field": "Principal Investigator & Institution",
            "required": True,
            "status": bool(trial.principal_investigator_id or trial.principal_investigator),
            "description": "Verified medical or Ayurvedic investigator credentials and affiliations."
        },
        {
            "field": "Clinical Study Site Assignment",
            "required": True,
            "status": bool(trial.site_id or trial.site),
            "description": "Registered GCP-compliant trial site facility details."
        },
    ]

    completed_count = sum(1 for item in checklist if item["status"])
    total_count = len(checklist)
    score_pct = round((completed_count / total_count) * 100)

    return {
        "trial_id": str(trial.id),
        "study_id": trial.study_id,
        "ctri_number": trial.ctri_number or "NOT_REGISTERED",
        "completeness_score": score_pct,
        "is_ready_for_submission": score_pct >= 85,
        "checklist": checklist,
        "completed_count": completed_count,
        "total_count": total_count,
    }
