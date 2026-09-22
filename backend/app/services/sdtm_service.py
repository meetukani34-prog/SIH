"""CDISC SDTM Export Service.
Generates standard SDTM AE (Adverse Events), DM (Demographics), and DS (Disposition)
datasets aligned with CDISC Controlled Terminology (cdisc.org) and Define-XML 2.1 specs.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent


def generate_sdtm_ae(db: Session, trial_id: Any) -> Dict[str, Any]:
    """Generate CDISC SDTM AE (Adverse Events) Domain dataset."""
    try:
        trial_uuid = uuid.UUID(str(trial_id)) if not isinstance(trial_id, uuid.UUID) else trial_id
    except (ValueError, TypeError):
        return {}

    trial = db.query(Trial).filter(Trial.id == trial_uuid).first()
    if not trial:
        return {}

    aes = db.query(AdverseEvent).filter(AdverseEvent.trial_id == trial.id).all()
    records: List[Dict[str, Any]] = []

    columns = [
        "STUDYID", "DOMAIN", "USUBJID", "AESEQ", "AETERM",
        "AEMODIFY", "AEDECOD", "AEBODSYS", "AESTDTC", "AESER",
        "AESEV", "AEREL", "AEOUT"
    ]

    for idx, ae in enumerate(aes, 1):
        participant = db.query(Participant).filter(Participant.id == ae.participant_id).first()
        usubjid = f"{trial.study_id}-{participant.participant_code if participant else 'UNKNOWN'}"
        
        records.append({
            "STUDYID": trial.study_id,
            "DOMAIN": "AE",
            "USUBJID": usubjid,
            "AESEQ": idx,
            "AETERM": ae.event_term,
            "AEMODIFY": ae.ayurvedic_term or ae.event_term,
            "AEDECOD": ae.meddra_term or ae.event_term,
            "AEBODSYS": "GASTROINTESTINAL DISORDERS" if "Dyspepsia" in (ae.meddra_term or "") else "GENERAL DISORDERS",
            "AESTDTC": ae.onset_date.strftime("%Y-%m-%d") if ae.onset_date else "",
            "AESER": "Y" if ae.is_serious else "N",
            "AESEV": ae.severity.upper() if ae.severity else "MILD",
            "AEREL": (ae.causality or "POSSIBLE").upper(),
            "AEOUT": (ae.outcome or "NOT RECOVERED").upper()
        })

    return {
        "domain": "AE",
        "domain_name": "Adverse Events",
        "study_id": trial.study_id,
        "standard": "CDISC SDTM v3.3 (Aligned Demonstration)",
        "controlled_terminology": "NCI Thesaurus / CDISC CT 2026-03",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "columns": columns,
        "records": records
    }


def generate_sdtm_dm(db: Session, trial_id: Any) -> Dict[str, Any]:
    """Generate CDISC SDTM DM (Demographics) Domain dataset."""
    try:
        trial_uuid = uuid.UUID(str(trial_id)) if not isinstance(trial_id, uuid.UUID) else trial_id
    except (ValueError, TypeError):
        return {}

    trial = db.query(Trial).filter(Trial.id == trial_uuid).first()
    if not trial:
        return {}

    participants = db.query(Participant).filter(Participant.trial_id == trial.id).all()
    records: List[Dict[str, Any]] = []

    columns = [
        "STUDYID", "DOMAIN", "USUBJID", "SUBJID", "RFSTDTC",
        "SEX", "AGE", "AGEU", "ARM", "COUNTRY"
    ]

    for p in participants:
        usubjid = f"{trial.study_id}-{p.participant_code}"
        records.append({
            "STUDYID": trial.study_id,
            "DOMAIN": "DM",
            "USUBJID": usubjid,
            "SUBJID": p.participant_code,
            "RFSTDTC": p.enrollment_date.strftime("%Y-%m-%d") if p.enrollment_date else "",
            "SEX": p.sex or "U",
            "AGE": p.age_group or "30",
            "AGEU": "YEARS",
            "ARM": "ACTIVE AYURVEDIC FORMULATION",
            "COUNTRY": "IND"
        })

    return {
        "domain": "DM",
        "domain_name": "Demographics",
        "study_id": trial.study_id,
        "standard": "CDISC SDTM v3.3 (Aligned Demonstration)",
        "controlled_terminology": "NCI Thesaurus / CDISC CT 2026-03",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "columns": columns,
        "records": records
    }


def generate_sdtm_ds(db: Session, trial_id: Any) -> Dict[str, Any]:
    """Generate CDISC SDTM DS (Disposition) Domain dataset."""
    try:
        trial_uuid = uuid.UUID(str(trial_id)) if not isinstance(trial_id, uuid.UUID) else trial_id
    except (ValueError, TypeError):
        return {}

    trial = db.query(Trial).filter(Trial.id == trial_uuid).first()
    if not trial:
        return {}

    participants = db.query(Participant).filter(Participant.trial_id == trial.id).all()
    records: List[Dict[str, Any]] = []

    columns = ["STUDYID", "DOMAIN", "USUBJID", "DSSEQ", "DSTERM", "DSDECOD", "DSCAT", "DSDTC"]

    for idx, p in enumerate(participants, 1):
        usubjid = f"{trial.study_id}-{p.participant_code}"
        decod = "INFORMED CONSENT OBTAINED" if p.status in ["SCREENING", "ENROLLED"] else "COMPLETED"
        records.append({
            "STUDYID": trial.study_id,
            "DOMAIN": "DS",
            "USUBJID": usubjid,
            "DSSEQ": idx,
            "DSTERM": f"Subject {p.status.lower()} in protocol",
            "DSDECOD": decod,
            "DSCAT": "PROTOCOL MILESTONE",
            "DSDTC": p.enrollment_date.strftime("%Y-%m-%d") if p.enrollment_date else ""
        })

    return {
        "domain": "DS",
        "domain_name": "Disposition",
        "study_id": trial.study_id,
        "standard": "CDISC SDTM v3.3 (Aligned Demonstration)",
        "controlled_terminology": "NCI Thesaurus / CDISC CT 2026-03",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "columns": columns,
        "records": records
    }
