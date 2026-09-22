"""FHIR R4 & ABDM (Ayushman Bharat Digital Mission) Interoperability Service.
Generates HL7 FHIR R4 compliant bundles aligned with NHA / NRCES specifications
for ResearchStudy, ResearchSubject, AdverseEvent, and Research Consent resources.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.trial import Trial
from app.models.participant import Participant
from app.models.adverse_event import AdverseEvent


def generate_trial_fhir_bundle(db: Session, trial_id: Any) -> Dict[str, Any]:
    """Generate a FHIR R4 Collection Bundle aligned with ABDM (Ayushman Bharat Digital Mission) and HL7 profiles."""
    try:
        trial_uuid = uuid.UUID(str(trial_id)) if not isinstance(trial_id, uuid.UUID) else trial_id
    except (ValueError, TypeError):
        return {}

    trial = db.query(Trial).filter(Trial.id == trial_uuid).first()
    if not trial:
        return {}

    participants = db.query(Participant).filter(Participant.trial_id == trial.id).all()
    adverse_events = db.query(AdverseEvent).filter(AdverseEvent.trial_id == trial.id).all()

    entries: List[Dict[str, Any]] = []

    # 1. FHIR ResearchStudy Resource (Aligned with CTRI & ABDM)
    research_study_resource = {
        "resourceType": "ResearchStudy",
        "id": str(trial.id),
        "meta": {
            "profile": [
                "http://hl7.org/fhir/uv/clinical-trials/StructureDefinition/clinical-trial-bundle",
                "https://nrces.in/ndhm/fhir/r4/StructureDefinition/ResearchStudy"
            ]
        },
        "identifier": [
            {"system": "urn:ayurctms:study_id", "value": trial.study_id},
            {"system": "http://ctri.nic.in", "value": trial.ctri_number or "CTRI/PENDING"}
        ],
        "title": trial.title,
        "status": trial.status.lower() if trial.status else "draft",
        "phase": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/research-study-phase",
                "code": trial.phase or "phase-2",
                "display": trial.phase or "Phase II"
            }]
        },
        "category": [{
            "coding": [{
                "system": "http://ayush.gov.in/clinical-trials/ayurveda",
                "code": "ayurveda-interventional",
                "display": "Ayurveda Interventional Clinical Trial"
            }]
        }],
        "condition": [
            {"text": trial.indication or "Clinical Evaluation"}
        ],
        "description": f"Intervention: {trial.intervention or 'Traditional Formulation'}. Protocol: {trial.protocol_version or '1.0'}"
    }
    entries.append({
        "fullUrl": f"urn:uuid:{trial.id}",
        "resource": research_study_resource
    })

    # 2. FHIR ResearchSubject Resources (With ABDM ABHA Pseudonymous Token)
    for p in participants:
        subject_resource = {
            "resourceType": "ResearchSubject",
            "id": str(p.id),
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ResearchSubject"]
            },
            "identifier": [
                {"system": "urn:ayurctms:participant_code", "value": p.participant_code},
                {
                    "system": "https://healthid.abdm.gov.in/pseudonym",
                    "value": f"ABHA-PSEUDO-{p.participant_code.replace('-', '')}"
                }
            ],
            "status": "candidate" if p.status == "SCREENING" else ("on-study" if p.status == "ENROLLED" else "off-study"),
            "study": {
                "reference": f"ResearchStudy/{trial.id}",
                "display": trial.study_id
            },
            "individual": {
                "display": f"Pseudonymous Participant [{p.participant_code}] (ABHA De-identified)"
            },
            "actualArm": "Active Ayurvedic Formulation Arm"
        }
        entries.append({
            "fullUrl": f"urn:uuid:{p.id}",
            "resource": subject_resource
        })

    # 3. FHIR AdverseEvent Resources (Aligned with MedDRA & WHO-UMC)
    for ae in adverse_events:
        ae_resource = {
            "resourceType": "AdverseEvent",
            "id": str(ae.id),
            "actuality": "actual",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-category",
                    "code": "product-use-error" if not ae.is_serious else "serious-adverse-event",
                    "display": "Serious Adverse Event" if ae.is_serious else "Adverse Event"
                }]
            }],
            "event": {
                "coding": [{
                    "system": "https://www.meddra.org",
                    "code": ae.meddra_code or "10001367",
                    "display": ae.meddra_term or ae.event_term
                }],
                "text": f"{ae.event_term} (Ayurvedic correlate: {ae.ayurvedic_term or 'N/A'})"
            },
            "subject": {
                "reference": f"ResearchSubject/{ae.participant_id}"
            },
            "date": ae.onset_date.isoformat() if ae.onset_date else None,
            "seriousness": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-seriousness",
                    "code": "serious" if ae.is_serious else "non-serious",
                    "display": "Serious" if ae.is_serious else "Non-serious"
                }]
            },
            "outcome": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/adverse-event-outcome",
                    "code": (ae.outcome or "recovering").lower(),
                    "display": ae.outcome or "Recovering"
                }]
            }
        }
        entries.append({
            "fullUrl": f"urn:uuid:{ae.id}",
            "resource": ae_resource
        })

    # 4. FHIR Consent Resource (ABDM Electronic Informed Consent Artefact)
    consent_resource = {
        "resourceType": "Consent",
        "id": f"consent-{trial.id}",
        "status": "active",
        "scope": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                "code": "research",
                "display": "Clinical Trial Research"
            }]
        },
        "category": [{
            "coding": [{
                "system": "https://nrces.in/ndhm/fhir/r4/CodeSystem/consent-category",
                "code": "ayush-clinical-trial",
                "display": "Informed Consent for Ayurvedic Clinical Evaluation"
            }]
        }],
        "policyRule": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "OPTIN",
                "display": "Opt-in to Research Study Protocol"
            }]
        },
        "dateTime": datetime.now(timezone.utc).isoformat()
    }
    entries.append({
        "fullUrl": f"urn:uuid:consent-{trial.id}",
        "resource": consent_resource
    })

    now_utc = datetime.now(timezone.utc)
    return {
        "resourceType": "Bundle",
        "type": "collection",
        "timestamp": now_utc.isoformat(),
        "total": len(entries),
        "meta": {
            "source": "AyurCTMS FHIR R4 & ABDM Regulatory Export Engine",
            "profile": [
                "http://hl7.org/fhir/uv/clinical-trials/StructureDefinition/clinical-trial-bundle",
                "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"
            ],
            "abdmBuildingBlocks": {
                "specification": "Ayushman Bharat Digital Mission (ABDM) Health Data Interchange",
                "nhaProfile": "NRCES / ABDM v2.0 Sandbox Aligned",
                "dataCustodian": "All India Institute of Ayurveda (AIIA)",
                "consentArchitecture": "ABDM Electronic Consent Manager (HIEC / HIU)"
            },
            "regulatoryNotice": "Demonstration bundle aligned with HL7 FHIR R4 and ABDM research study profiles."
        },
        "entry": entries
    }
